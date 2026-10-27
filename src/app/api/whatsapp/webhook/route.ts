import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Meta WhatsApp Cloud API Webhook Handler
 * 
 * 1. GET: Verification handshake with Meta servers
 * 2. POST: Event listener for message status updates (sent, delivered, read, failed) & inbound customer messages
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Default verify token configured for Root & Harvest
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "root_harvest_webhook_verify_2026";

    // Meta checks that mode is 'subscribe' and that the verify_token matches
    if (mode === "subscribe" && token === expectedToken) {
      console.log("[WhatsApp Webhook] Verification successful from Meta!");
      // Meta requires returning the challenge string as a raw text response with status 200
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
    const body = await req.json();

    // Verify payload is from WhatsApp Business Account
    if (body.object === "whatsapp_business_account" || body.entry) {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // Process status updates (sent, delivered, read, failed)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              console.log(
                `[WhatsApp Webhook Status] Message ${status.id} -> ${status.status} (recipient: ${status.recipient_id})`
              );

              // If delivery failed or encountered an error from Meta
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

          // Process incoming customer messages (replies to Root & Harvest WhatsApp)
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const textContent = msg.type === "text" ? msg.text?.body : `[${msg.type} message]`;
              console.log(`[WhatsApp Webhook Inbound] From ${msg.from}: ${textContent}`);
              try {
                await prisma.whatsappLog.create({
                  data: {
                    recipient: msg.from || "unknown",
                    messageType: "INCOMING_CUSTOMER_MESSAGE",
                    status: "RECEIVED",
                    metaResponse: JSON.stringify(msg),
                    errorMessage: null,
                  },
                });
              } catch (dbErr) {
                console.error("[WhatsApp Webhook DB Error]", dbErr);
              }
            }
          }
        }
      }

      // Meta requires a 200 OK response within a few seconds
      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return NextResponse.json({ status: "IGNORED" }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook POST Error]", error);
    // Always return 200 OK so Meta does not keep retrying failed webhook deliveries repeatedly
    return NextResponse.json({ status: "ERROR_LOGGED" }, { status: 200 });
  }
}
