import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { recipient, message } = body;

    if (!recipient || !message) {
      return NextResponse.json({ error: "Recipient and message body are required." }, { status: 400 });
    }

    // Send the test WhatsApp message using Meta service
    const result = await WhatsappMetaService.sendMessageWithRetry(recipient, message, "TEST");

    if (result.success) {
      return NextResponse.json({ success: true, response: result.responseText });
    } else {
      return NextResponse.json({ error: result.errMessage || "Failed to send WhatsApp message" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[WHATSAPP_TEST_POST]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
