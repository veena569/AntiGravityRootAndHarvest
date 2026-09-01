import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email.service";
import { WhatsappService } from "@/services/whatsapp.service";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Authorization check (enforced if CRON_SECRET is configured)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // 1. Process Checkout Leads older than 30 mins
    const abandonedLeads = await prisma.checkoutLead.findMany({
      where: {
        abandoned: true,
        recovered: false,
        updatedAt: { lte: thirtyMinsAgo },
        OR: [
          { emailSent: false },
          { whatsappSent: false },
        ],
      },
    });

    console.info(`[CRON_ABANDONED_CART] Found ${abandonedLeads.length} abandoned checkout leads to process.`);

    let leadsProcessed = 0;
    for (const lead of abandonedLeads) {
      const items = Array.isArray(lead.cartItems) ? (lead.cartItems as any[]) : [];
      const firstItemName = items[0]?.name || "Wood Pressed Oil & Organic Grains";
      const customerName = lead.name || "Customer";

      // Send Email Reminder
      if (lead.email && !lead.emailSent) {
        try {
          const mockOrder = {
            orderNumber: `LEAD-${lead.id.slice(-6).toUpperCase()}`,
            shippingName: customerName,
            shippingEmail: lead.email,
            total: lead.cartTotal || 0,
          };
          await EmailService.sendCartReminderEmail(mockOrder, items);
          await prisma.checkoutLead.update({
            where: { id: lead.id },
            data: { emailSent: true },
          });
        } catch (err) {
          console.error(`[CRON_ABANDONED_CART] Email failed for lead ${lead.id}:`, err);
        }
      }

      // Send WhatsApp Reminder
      if (lead.phone && !lead.whatsappSent) {
        try {
          const msg = `Hi ${customerName}! 🌿 You left ${firstItemName} in your Root & Harvest cart.\n\nComplete your order now with FREE Shipping & 100% Pure Cold-Pressed quality: https://www.rootandharvest.in/checkout`;
          await WhatsappService.sendCustomerWhatsApp(lead.phone, msg);
          WhatsappMetaService.queueMessage(lead.phone, msg, "CUSTOMER");
          await prisma.checkoutLead.update({
            where: { id: lead.id },
            data: { whatsappSent: true },
          });
        } catch (err) {
          console.error(`[CRON_ABANDONED_CART] WhatsApp failed for lead ${lead.id}:`, err);
        }
      }

      leadsProcessed++;
    }

    // 2. Process Pending Orders older than 2 hours
    const abandonedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "pending",
        cartReminderSent: false,
        createdAt: { lte: twoHoursAgo },
      },
      include: { items: true },
    });

    console.info(`[CRON_ABANDONED_CART] Found ${abandonedOrders.length} abandoned orders to remind.`);

    const sentOrders = [];
    for (const order of abandonedOrders) {
      if (order.shippingEmail) {
        try {
          await EmailService.sendCartReminderEmail(order, order.items);
          await prisma.order.update({
            where: { id: order.id },
            data: { cartReminderSent: true },
          });
          sentOrders.push(order.orderNumber);
        } catch (err) {
          console.error(`[CRON_ABANDONED_CART] Error sending reminder for order ${order.orderNumber}:`, err);
        }
      }

      if (order.shippingPhone) {
        try {
          const firstItem = order.items[0]?.name || "Root & Harvest Fresh Oils";
          const msg = `Hi ${order.shippingName}! 🌿 Your order (${order.orderNumber}) for ${firstItem} is waiting.\n\nComplete your payment now: https://www.rootandharvest.in/checkout`;
          await WhatsappService.sendCustomerWhatsApp(order.shippingPhone, msg);
          WhatsappMetaService.queueMessage(order.shippingPhone, msg, "CUSTOMER", order.id);
        } catch (err) {
          console.error(`[CRON_ABANDONED_CART] WhatsApp error for order ${order.orderNumber}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      leadsProcessed,
      ordersProcessed: abandonedOrders.length,
      sentOrders,
    });
  } catch (error: any) {
    console.error("[CRON_ABANDONED_CART_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to process abandoned cart reminder cron" }, { status: 500 });
  }
}
