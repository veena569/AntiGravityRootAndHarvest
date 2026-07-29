import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { EmailService } from "@/services/email.service";

const sendEmailOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = sendEmailOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();
    
    // Generate a 6-digit numeric OTP code
    const code = (Math.floor(Math.random() * 900000) + 100000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save to Otp table
    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });

    // Send code via Nodemailer
    await EmailService.sendEmailOtp(normalizedEmail, code);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email address",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[SEND_EMAIL_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to send email verification code" }, { status: 500 });
  }
}
