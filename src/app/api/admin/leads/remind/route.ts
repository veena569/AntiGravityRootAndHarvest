import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email.service";
import { WhatsappService } from "@/services/whatsapp.service";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { leadId, type } = await req.json();
    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const lead = await prisma.checkoutLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const items = Array.isArray(lead.cartItems) ? (lead.cartItems as any[]) : [];
    const firstItemName = items[0]?.name || "Wood Pressed Oil & Organic Grains";
    const customerName = lead.name || "Customer";

    if (type === "whatsapp") {
      if (!lead.phone) {
        return NextResponse.json({ error: "No phone number registered for this lead" }, { status: 400 });
      }

      const msg = `Hi ${customerName}! 🌿 You left ${firstItemName} in your Root & Harvest cart.\n\nComplete your order now with FREE Shipping & 100% Pure Cold-Pressed quality: https://www.rootandharvest.in/checkout`;

      // Trigger Twilio + Meta WhatsApp Services
      await WhatsappService.sendCustomerWhatsApp(lead.phone, msg);
      WhatsappMetaService.queueMessage(lead.phone, msg, "CUSTOMER");

      await prisma.checkoutLead.update({
        where: { id: leadId },
        data: { whatsappSent: true },
      });

      return NextResponse.json({ success: true, message: "WhatsApp reminder sent successfully" });
    }

    if (type === "email") {
      if (!lead.email) {
        return NextResponse.json({ error: "No email address registered for this lead" }, { status: 400 });
      }

      // Format mock order object for EmailService
      const mockOrder = {
        orderNumber: `LEAD-${lead.id.slice(-6).toUpperCase()}`,
        shippingName: customerName,
        shippingEmail: lead.email,
        total: lead.cartTotal || 0,
      };

      await EmailService.sendCartReminderEmail(mockOrder, items);

      await prisma.checkoutLead.update({
        where: { id: leadId },
        data: { emailSent: true },
      });

      return NextResponse.json({ success: true, message: "Email reminder sent successfully" });
    }

    return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 });
  } catch (error: any) {
    console.error("[ADMIN_LEAD_REMIND_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to send reminder" }, { status: 500 });
  }
}
