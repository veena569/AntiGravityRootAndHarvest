export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const session = await AuthService.registerWithPassword({
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
    });

    cookies().set(authConfig.cookies.accessToken, session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    if (session.refreshToken) {
      cookies().set(authConfig.cookies.refreshToken, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return NextResponse.json({
      success: true,
      user: session.user,
      message: "Registration successful. Verification email sent.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to register account" },
      { status: 400 }
    );
  }
}
