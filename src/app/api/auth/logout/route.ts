import { NextResponse } from "next/server";
import { JwtService } from "@/services/jwt.service";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

export async function POST() {
  try {
    const refreshTokenCookie = cookies().get(authConfig.cookies.refreshToken)?.value;

    if (refreshTokenCookie) {
      await JwtService.revokeRefreshToken(refreshTokenCookie);
    }

    // Clear cookies
    cookies().delete(authConfig.cookies.accessToken);
    cookies().delete(authConfig.cookies.refreshToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[LOGOUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
