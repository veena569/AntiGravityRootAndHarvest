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
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
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
