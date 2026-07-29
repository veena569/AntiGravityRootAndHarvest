import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email.service";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Authorization check (only enforced if CRON_SECRET is configured in environment)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2 hours ago threshold
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // Find all orders that are still pending payment, have not received a reminder,
    // and were created at least 2 hours ago.
    const abandonedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "pending",
        cartReminderSent: false,
        createdAt: {
          lte: twoHoursAgo,
        },
      },
      include: {
        items: true,
      },
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
    }

    return NextResponse.json({
      success: true,
      processed: abandonedOrders.length,
      sent: sentOrders,
    });
  } catch (error: any) {
    console.error("[CRON_ABANDONED_CART_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to process abandoned cart reminder cron" }, { status: 500 });
  }
}
