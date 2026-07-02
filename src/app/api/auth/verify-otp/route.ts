export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  code: z.string().length(authConfig.otp.length, "Invalid OTP length"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, code } = verifyOtpSchema.parse(body);

    const session = await AuthService.verifyAndLogin(phone, code);

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Set Cookies
    cookies().set(authConfig.cookies.accessToken, session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    if (session.refreshToken) {
      cookies().set(authConfig.cookies.refreshToken, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: session.user 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[VERIFY_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
