import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { OtpService } from "@/services/otp.service";
import { UserService } from "@/services/user.service";
import { WhatsAppProviderFactory } from "@/services/messaging/whatsapp-provider.factory";

export const dynamic = "force-dynamic";

// In-memory cache to deduplicate webhook events by message ID (persists across warm serverless invocations)
const processedMessageIds = new Set<string>();

/**
 * Validates Meta webhook payload signature (X-Hub-Signature-256)
 */
function validateMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // If secret is not yet set in environment, log warning and allow through in non-prod
    if (process.env.NODE_ENV === "production") {
      console.warn("[WhatsApp Webhook] META_APP_SECRET not configured in production environment.");
    }
    return true;
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const signatureHash = signatureHeader.replace("sha256=", "");
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Meta WhatsApp Cloud API Webhook Handler
 * 
 * 1. GET: Verification handshake with Meta servers
 * 2. POST: Secure event receiver for inbound customer messages and delivery statuses
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "root_harvest_webhook_verify_2026";

    if (mode === "subscribe" && token === expectedToken) {
      console.log("[WhatsApp Webhook] Verification successful from Meta!");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook] Verification failed. Token mismatch or bad mode.", {
      receivedToken: token,
      receivedMode: mode,
    });
    return new Response("Forbidden", { status: 403 });
  } catch (error) {
    console.error("[WhatsApp Webhook GET Error]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    // Enforce HMAC-SHA256 signature validation
    const isValid = validateMetaSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[WhatsApp Webhook] Invalid webhook signature detected. Rejecting request.");
      return new Response("Unauthorized signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object === "whatsapp_business_account" || body.entry) {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // 1. Process delivery statuses (sent, delivered, read, failed)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              if (status.status === "failed" || (status.errors && status.errors.length > 0)) {
                console.error("[WhatsApp Webhook Delivery Failure]", status.errors);
                try {
                  await prisma.whatsappLog.create({
                    data: {
                      recipient: status.recipient_id || "unknown",
                      messageType: "WEBHOOK_STATUS_UPDATE",
                      status: "FAILED",
                      metaResponse: JSON.stringify(status),
                      errorMessage: status.errors
                        ? status.errors
                            .map((e: any) => `[${e.code}] ${e.title || ""}: ${e.message || e.details || ""}`)
                            .join("; ")
                        : `Delivery status: ${status.status}`,
                    },
                  });
                } catch (dbErr) {
                  console.error("[WhatsApp Webhook DB Error]", dbErr);
                }
              }
            }
          }

          // 2. Process incoming customer messages
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const messageId = msg.id;

              // Deduplicate events to ensure idempotency
              if (messageId) {
                if (processedMessageIds.has(messageId)) {
                  console.log(`[WhatsApp Webhook] Duplicate message ${messageId} ignored.`);
                  continue;
                }
                processedMessageIds.add(messageId);
                // Keep set bounded to prevent memory growth
                if (processedMessageIds.size > 2000) {
                  const firstItem = processedMessageIds.values().next().value;
                  if (firstItem) processedMessageIds.delete(firstItem);
                }
              }

              const fromRaw = msg.from || "";
              const textBody = (msg.type === "text" ? msg.text?.body || "" : "").toLowerCase().trim();

              console.log(`[WhatsApp Webhook Inbound] From ${fromRaw}: ${textBody}`);

              // Check if customer is requesting a login OTP
              const isLoginIntent =
                textBody.includes("login") ||
                textBody.includes("log in") ||
                textBody.includes("otp") ||
                textBody.includes("code") ||
                textBody.includes("root & harvest") ||
                textBody.includes("root and harvest");

              if (isLoginIntent && fromRaw) {
                const cleanPhoneDigits = fromRaw.replace(/\D/g, "").slice(-10);
                const normalizedPhone = `+91${cleanPhoneDigits}`;

                // Check if existing customer account exists
                const existingUser = await UserService.findByPhone(cleanPhoneDigits);

                if (!existingUser) {
                  // Stage 2 Constraint: Do not automatically create customer accounts through this login-only flow.
                  console.log(`[WhatsApp Login] Phone ${cleanPhoneDigits} requested login, but no existing account found. Informing customer.`);
                  const provider = WhatsAppProviderFactory.getProvider();
                  if (provider.sendCustomerNotification) {
                    await provider.sendCustomerNotification(
                      cleanPhoneDigits,
                      `🌿 *Root & Harvest*\n\nWe received a login request, but no existing customer account is registered under this WhatsApp number.\n\nIf you are a new customer, please visit our store to place your first order:\n👉 https://rootandharvest.in`
                    );
                  }
                  continue;
                }

                // Customer exists: Check rate limit (1 request per 30 seconds)
                const recentOtp = await prisma.otp.findFirst({
                  where: {
                    phone: normalizedPhone,
                    createdAt: {
                      gte: new Date(Date.now() - 30 * 1000),
                    },
                  },
                });

                if (recentOtp) {
                  console.log(`[WhatsApp Login Rate Limit] Phone ${cleanPhoneDigits} requested OTP too quickly.`);
                  const provider = WhatsAppProviderFactory.getProvider();
                  if (provider.sendCustomerNotification) {
                    await provider.sendCustomerNotification(
                      cleanPhoneDigits,
                      `🌿 *Root & Harvest*\n\nA login code was recently sent to your WhatsApp. Please check your messages above, or wait 30 seconds before requesting a new code.`
                    );
                  }
                  continue;
                }

                // Generate and dispatch secure 6-digit OTP
                console.log(`[WhatsApp Login] Generating login OTP for verified customer ${cleanPhoneDigits}.`);
                await OtpService.generateOtp({
                  phone: normalizedPhone,
                  purpose: "LOGIN",
                });
              }
            }
          }
        }
      }

      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return NextResponse.json({ status: "IGNORED" }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook POST Error]", error);
    return NextResponse.json({ status: "ERROR_LOGGED" }, { status: 200 });
  }
}
