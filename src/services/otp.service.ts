import { prisma } from "@/lib/db";
import otpGenerator from "otp-generator";
import { addMinutes } from "date-fns";
import { authConfig } from "@/config/auth";

export class OtpService {
  /**
   * Generates a new OTP for the given phone or email
   */
  static async generateOtp({ phone, email }: { phone?: string; email?: string }): Promise<string> {
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

    // MOCK: In production, call SMS/Email provider here
    console.log(`\n\n========================================`);
    console.log(`[MOCK NOTIFICATION] OTP for ${phone || email}: ${code}`);
    console.log(`========================================\n\n`);

    return otpRecord.id;
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
