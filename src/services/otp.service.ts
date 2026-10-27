import { prisma } from "@/lib/db";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { authConfig } from "@/config/auth";
import { WhatsAppProviderFactory } from "./messaging/whatsapp-provider.factory";

// In-memory tracker for failed verification attempts per phone
const failedAttemptsMap = new Map<string, { count: number; lastAttempt: number }>();

export class OtpService {
  /**
   * Generates a cryptographically secure 6-digit OTP for phone or email
   */
  static async generateOtp({
    phone,
    email,
    purpose = "LOGIN",
  }: {
    phone?: string;
    email?: string;
    purpose?: string;
  }): Promise<{ referenceId: string; code: string }> {
    if (!phone && !email) {
      throw new Error("Phone or email is required to generate OTP");
    }

    const normalizedTarget = phone
      ? `+91${phone.replace(/\D/g, "").slice(-10)}`
      : email!.toLowerCase().trim();

    // Invalidate any existing unverified OTPs for this phone/email
    await prisma.otp.updateMany({
      where: {
        OR: [
          ...(phone ? [{ phone: normalizedTarget }, { phone }] : []),
          ...(email ? [{ email: normalizedTarget }] : []),
        ],
        verified: false,
      },
      data: {
        verified: true, // Invalidate previous challenges
      },
    });

    // Reset failed attempts counter on new OTP generation
    if (phone) {
      failedAttemptsMap.delete(normalizedTarget);
    }

    // Cryptographically secure 6-digit numeric code
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = addMinutes(new Date(), authConfig.otp.expiryMinutes);

    const otpRecord = await prisma.otp.create({
      data: {
        phone: phone ? normalizedTarget : null,
        email: email ? normalizedTarget : null,
        code,
        expiresAt,
      },
    });

    // Send through decoupled WhatsApp messaging provider if phone is provided
    if (phone) {
      const cleanPhone = normalizedTarget.replace(/\D/g, "").slice(-10);
      try {
        const provider = WhatsAppProviderFactory.getProvider();
        await provider.sendLoginOtp(cleanPhone, code, {
          expiresInMinutes: authConfig.otp.expiryMinutes,
        });
      } catch (waErr) {
        console.error("[OTP_SERVICE_WHATSAPP_DISPATCH_ERROR]", waErr);
      }
    }

    return { referenceId: otpRecord.id, code };
  }

  /**
   * Verifies the OTP with attempt limiting, atomic state transition, and replay prevention
   */
  static async verifyOtp(
    code: string,
    { phone, email }: { phone?: string; email?: string }
  ): Promise<boolean> {
    if (!phone && !email) return false;

    const normalizedTarget = phone
      ? `+91${phone.replace(/\D/g, "").slice(-10)}`
      : email!.toLowerCase().trim();

    // Check failed attempts limit (max 5)
    if (phone) {
      const attemptData = failedAttemptsMap.get(normalizedTarget);
      if (attemptData && attemptData.count >= authConfig.otp.maxAttempts) {
        // Invalidate all active OTPs for this phone due to brute-force threshold
        await prisma.otp.updateMany({
          where: {
            OR: [{ phone: normalizedTarget }, { phone }],
            verified: false,
          },
          data: { verified: true },
        });
        console.warn(`[OTP_LOCKOUT] Max verification attempts exceeded for ${normalizedTarget.slice(0, 6)}***`);
        return false;
      }
    }

    // Look up unverified, unexpired OTP
    const record = await prisma.otp.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone: normalizedTarget }, { phone }] : []),
          ...(email ? [{ email: normalizedTarget }] : []),
        ],
        code,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      // Record failed attempt
      if (phone) {
        const current = failedAttemptsMap.get(normalizedTarget) || { count: 0, lastAttempt: Date.now() };
        failedAttemptsMap.set(normalizedTarget, {
          count: current.count + 1,
          lastAttempt: Date.now(),
        });
      }
      return false;
    }

    // Atomic update to mark verified and prevent concurrent verification race conditions
    const updateResult = await prisma.otp.updateMany({
      where: {
        id: record.id,
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    if (updateResult.count === 0) {
      // Already verified by concurrent request (replay attack prevented)
      return false;
    }

    // Clear failed attempts upon successful verification
    if (phone) {
      failedAttemptsMap.delete(normalizedTarget);
    }

    return true;
  }
}
