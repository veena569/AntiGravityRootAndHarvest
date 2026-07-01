import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

export async function POST(req: Request) {
  try {
    const refreshTokenCookie = cookies().get(authConfig.cookies.refreshToken)?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
    }

    const session = await AuthService.refreshSession(refreshTokenCookie);

    if (!session) {
      // Clear cookies if refresh fails (token revoked or expired)
      cookies().delete(authConfig.cookies.accessToken);
      cookies().delete(authConfig.cookies.refreshToken);
      return NextResponse.json({ error: "Session expired, please login again" }, { status: 401 });
    }

    // Set new cookies
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
    console.error("[REFRESH_ERROR]", error);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
