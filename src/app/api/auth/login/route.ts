export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const session = await AuthService.loginWithPassword({ email, password });

    if (!session) {
      return NextResponse.json(
        { error: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    cookies().set(authConfig.cookies.accessToken, session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    if (session.refreshToken) {
      cookies().set(authConfig.cookies.refreshToken, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }

    // Retrieve user's saved addresses for seamless checkout auto-fill
    let addresses: any[] = [];
    try {
      const { prisma } = await import("@/lib/db");
      addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: session.user,
      addresses,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
