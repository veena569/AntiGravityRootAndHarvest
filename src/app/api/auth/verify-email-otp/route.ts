import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { UserService } from "@/services/user.service";
import { JwtService } from "@/services/jwt.service";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

const verifyEmailOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, name } = verifyEmailOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // Look up code in Otp table
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Incorrect or expired verification code" }, { status: 400 });
    }

    // Mark OTP as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Find or create user
    const user = await UserService.findOrCreateByEmail(normalizedEmail, name);

    // Generate JWT access & refresh tokens
    const accessToken = await JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    // Set cookies
    cookies().set(authConfig.cookies.accessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    cookies().set(authConfig.cookies.refreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[VERIFY_EMAIL_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to verify email code" }, { status: 500 });
  }
}
