export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const token = cookies().get(authConfig.cookies.accessToken)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await JwtService.verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        }
      });
    } catch (dbErr) {
      console.warn("[PROFILE_DB_WARN]", dbErr);
    }

    if (!user) {
      if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN" || payload.sub === "admin-master") {
        return NextResponse.json({
          user: {
            id: payload.sub,
            name: "System Administrator",
            email: "admin@rootandharvest.in",
            role: payload.role || "SUPER_ADMIN",
            createdAt: new Date().toISOString(),
          }
        });
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
