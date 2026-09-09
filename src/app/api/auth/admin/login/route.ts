export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { JwtService } from "@/services/jwt.service";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import bcrypt from "bcryptjs";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = adminLoginSchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();
    
    // Look up user by normalized email or alternate admin domain (.in vs .com)
    let altEmail = normalizedEmail;
    if (normalizedEmail.endsWith("@rootandharvest.com")) {
      altEmail = normalizedEmail.replace("@rootandharvest.com", "@rootandharvest.in");
    } else if (normalizedEmail.endsWith("@rootandharvest.in")) {
      altEmail = normalizedEmail.replace("@rootandharvest.in", "@rootandharvest.com");
    }

    let user = null;
    let dbError = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: normalizedEmail, mode: "insensitive" } },
              { email: { equals: altEmail, mode: "insensitive" } },
            ],
          },
        });
        dbError = null;
        break;
      } catch (err: any) {
        dbError = err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (dbError && !user) {
      console.error("[ADMIN_LOGIN_DB_ERROR]", dbError);
      return NextResponse.json(
        { error: "Database connection busy. Please try again in a few seconds." },
        { status: 500 }
      );
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid administrator email or password" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized access: Account lacks admin permissions" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid administrator email or password" }, { status: 401 });
    }

    const accessToken = await JwtService.generateAccessToken(user.id, user.role as any);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    // Set Cookies
    cookies().set(authConfig.cookies.accessToken, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    cookies().set(authConfig.cookies.refreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[ADMIN_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Authentication service unavailable. Please try again." }, { status: 500 });
  }
}
