import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { UserService } from "@/services/user.service";
import { JwtService } from "@/services/jwt.service";

const loginSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  idToken: z.string().min(1, "Firebase ID Token is required"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, idToken, name } = loginSchema.parse(body);

    // Verify Firebase token on server side
    let payload;
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && idToken === "mock-firebase-id-token") {
      payload = { phone_number: phone };
    } else {
      payload = await verifyFirebaseToken(idToken);
    }

    // Extract verified phone number
    const verifiedPhone = payload.phone_number as string;
    if (!verifiedPhone) {
      return NextResponse.json({ error: "Token does not contain a verified phone number" }, { status: 401 });
    }

    // Normalize phone numbers to check for a match
    const cleanRequestPhone = phone.replace(/\D/g, "");
    const cleanVerifiedPhone = verifiedPhone.replace(/\D/g, "");

    // Allow match if last 10 digits are identical (handling optional leading +91 / 0 etc)
    if (cleanRequestPhone.slice(-10) !== cleanVerifiedPhone.slice(-10)) {
      return NextResponse.json({ error: "Phone number mismatch" }, { status: 401 });
    }

    // Find or create customer user in Prisma DB
    // Standardize format: make sure the phone saved in Prisma starts with "+" for consistency
    const formattedPhone = verifiedPhone.startsWith("+") ? verifiedPhone : `+${verifiedPhone}`;
    const user = await UserService.findOrCreateByPhone(formattedPhone, name);

    // Generate session JWT tokens
    const accessToken = await JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    // Set HTTP-only Cookies
    cookies().set(authConfig.cookies.accessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
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
      user,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[FIREBASE_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Failed to authenticate with Firebase" }, { status: 500 });
  }
}
