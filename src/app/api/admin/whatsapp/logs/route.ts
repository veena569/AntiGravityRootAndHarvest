import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
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
