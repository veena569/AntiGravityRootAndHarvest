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

    let config = await prisma.whatsappConfig.findFirst();
    if (!config) {
      // Seed default record
      config = await prisma.whatsappConfig.create({
        data: {
          id: "default",
          businessNumber: "",
          accessToken: "",
          phoneNumberId: "",
          enableCustomerAlerts: true,
          enableAdminAlerts: true,
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("[WHATSAPP_CONFIG_GET]", error);
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { businessNumber, accessToken, phoneNumberId, enableCustomerAlerts, enableAdminAlerts } = body;

    const updatedConfig = await prisma.whatsappConfig.upsert({
      where: { id: "default" },
      update: {
        businessNumber: businessNumber ?? "",
        accessToken: accessToken ?? "",
        phoneNumberId: phoneNumberId ?? "",
        enableCustomerAlerts: typeof enableCustomerAlerts === "boolean" ? enableCustomerAlerts : true,
        enableAdminAlerts: typeof enableAdminAlerts === "boolean" ? enableAdminAlerts : true,
      },
      create: {
        id: "default",
        businessNumber: businessNumber ?? "",
        accessToken: accessToken ?? "",
        phoneNumberId: phoneNumberId ?? "",
        enableCustomerAlerts: typeof enableCustomerAlerts === "boolean" ? enableCustomerAlerts : true,
        enableAdminAlerts: typeof enableAdminAlerts === "boolean" ? enableAdminAlerts : true,
      },
    });

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error("[WHATSAPP_CONFIG_POST]", error);
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
  }
}
