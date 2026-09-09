import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { JwtService } from "@/services/jwt.service";
import { authConfig } from "@/config/auth";

export const dynamic = 'force-dynamic';

async function checkAdminAuth() {
  const headerRole = headers().get("x-user-role");
  if (headerRole === "ADMIN" || headerRole === "SUPER_ADMIN") return true;

  const token = cookies().get(authConfig.cookies.accessToken)?.value;
  if (token) {
    const payload = await JwtService.verifyToken(token);
    if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const logs = await prisma.whatsappLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[WHATSAPP_LOGS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
