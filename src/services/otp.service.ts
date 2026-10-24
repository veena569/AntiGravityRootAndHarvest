import { prisma } from "@/lib/db";
import otpGenerator from "otp-generator";
import { addMinutes } from "date-fns";
import { authConfig } from "@/config/auth";
import { WhatsappMetaService } from "./whatsapp-meta.service";

export class OtpService {
  /**
   * Generates a new OTP for the given phone or email
   */
  static async generateOtp({ phone, email }: { phone?: string; email?: string }): Promise<{ referenceId: string; code: string }> {
    if (!phone && !email) {
      throw new Error("Phone or email is required to generate OTP");
    }

    // Invalidate previous OTPs for this user
    await prisma.otp.updateMany({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : [])
        ],
        verified: false
      },
      data: {
        verified: true // Technically invalidating them
      }
    });

    const code = otpGenerator.generate(authConfig.otp.length, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true
    });

    const expiresAt = addMinutes(new Date(), authConfig.otp.expiryMinutes);

    const otpRecord = await prisma.otp.create({
      data: {
        phone: phone || null,
        email: email || null,
        code,
        expiresAt
      }
    });

    // 1. Send OTP instantly via WhatsApp Cloud API (Free & Real-time)
    if (phone) {
      const rawPhone = phone.replace(/\D/g, "").slice(-10);
      const waMessage = `🌿 *Root & Harvest*\n\nYour 6-digit verification code is: *${code}*\n\nValid for 10 minutes. Please do not share this code with anyone.`;
      WhatsappMetaService.queueMessage(rawPhone, waMessage, "CUSTOMER");
    }

    // 2. Secondary fallback via Fast2SMS if available
    if (process.env.FAST2SMS_API_KEY && phone) {
      const rawPhone = phone.replace(/\D/g, "").slice(-10);
      fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "Authorization": process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Your Root & Harvest verification code is: ${code}. Valid for 10 minutes.`,
          numbers: rawPhone,
        }),
      })
        .then(res => res.json())
        .then(resJson => {
          console.log(`[Fast2SMS SMS Sent] Phone: ${rawPhone}, Status:`, resJson);
        })
        .catch(smsErr => {
          console.error("[Fast2SMS Error sending SMS]", smsErr);
        });
    }

    // Console fallback
    console.log(`\n\n========================================`);
    console.log(`[MOCK NOTIFICATION] OTP for ${phone || email}: ${code}`);
    console.log(`========================================\n\n`);

    return { referenceId: otpRecord.id, code };
  }

  /**
   * Verifies the OTP
   */
  static async verifyOtp(code: string, { phone, email }: { phone?: string; email?: string }): Promise<boolean> {
    if (!phone && !email) return false;

    const record = await prisma.otp.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : [])
        ],
        code,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!record) return false;

    // Mark as verified
    await prisma.otp.update({
      where: { id: record.id },
      data: { verified: true }
    });

    return true;
  }
}
