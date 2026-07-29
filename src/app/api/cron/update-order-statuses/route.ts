import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email.service";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Helper to count elapsed 24-hour periods that do not land on a weekend
function getElapsedBusinessDays(startDate: Date, endDate: Date): number {
  let elapsedMs = endDate.getTime() - startDate.getTime();
  if (elapsedMs <= 0) return 0;
  
  let tempDate = new Date(startDate.getTime());
  let businessDays = 0;
  
  while (tempDate.getTime() + 24 * 60 * 60 * 1000 <= endDate.getTime()) {
    tempDate.setTime(tempDate.getTime() + 24 * 60 * 60 * 1000);
    const day = tempDate.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
      businessDays++;
    }
  }
  return businessDays;
}

// Helper to calculate the exact date/time the order reached "Out for Delivery" (exactly 5 business days after createdAt)
function getOutForDeliveryDate(createdAt: Date): Date {
  let target = new Date(createdAt.getTime());
  let businessDaysAdded = 0;
  while (businessDaysAdded < 5) {
    target.setTime(target.getTime() + 24 * 60 * 60 * 1000);
    const day = target.getDay();
    if (day !== 0 && day !== 6) {
      businessDaysAdded++;
    }
  }
  return target;
}

export async function GET(req: Request) {
  // Authorization check (only enforced if CRON_SECRET is configured)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all active orders that are paid/cod and not delivered yet
    const activeOrders = await prisma.order.findMany({
      where: {
        paymentStatus: { in: ["paid", "cod"] },
        orderStatus: { notIn: ["delivered", "cancelled"] },
      },
      include: {
        items: true,
      },
    });

    const now = new Date();
    const transitions = [];

    for (const order of activeOrders) {
      const businessDays = getElapsedBusinessDays(order.createdAt, now);
      let updatedStatus = order.orderStatus;
      let shouldUpdate = false;

      // 1. Transition Placed ➔ Packed ("Completed" packing) after 3 business days
      if (order.orderStatus === "placed" && businessDays >= 3) {
        updatedStatus = "packed";
        shouldUpdate = true;
      }

      // 2. Transition Packed ➔ Shipped after 4 business days
      if (order.orderStatus === "packed" && businessDays >= 4) {
        updatedStatus = "shipped";
        shouldUpdate = true;
      }

      // 3. Transition Shipped ➔ Out for Delivery after 5 business days
      if (order.orderStatus === "shipped" && businessDays >= 5) {
        updatedStatus = "out_for_delivery";
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await prisma.order.update({
          where: { id: order.id },
          data: { orderStatus: updatedStatus },
        });
        transitions.push({
          orderNumber: order.orderNumber,
          from: order.orderStatus,
          to: updatedStatus,
        });
        console.log(`[CRON_STATUS_UPDATE] Order ${order.orderNumber} transitioned from ${order.orderStatus} to ${updatedStatus}`);
      }

      // 4. Out for Delivery ➔ Delivered (after 12 hours, pending approval)
      // Check if order is out for delivery (either originally or just updated in this loop)
      const currentOrNewStatus = shouldUpdate ? updatedStatus : order.orderStatus;
      if (currentOrNewStatus === "out_for_delivery") {
        const outForDeliveryTime = getOutForDeliveryDate(order.createdAt);
        const deliveredThresholdTime = new Date(outForDeliveryTime.getTime() + 12 * 60 * 60 * 1000);

        if (now >= deliveredThresholdTime && !order.deliveryApprovalSent) {
          // Generate secure HMAC token
          const token = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "fallback-secret-key-1234")
            .update(order.id)
            .digest("hex");

          const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rootandharvest.in"}/api/orders/approve-delivery?orderId=${order.id}&token=${token}`;

          // Send approval email
          await EmailService.sendDeliveryApprovalEmail(order, order.items, approveUrl);

          // Mark approval email as sent
          await prisma.order.update({
            where: { id: order.id },
            data: { deliveryApprovalSent: true },
          });

          console.log(`[CRON_DELIVERY_APPROVAL] Sent delivery approval email for order ${order.orderNumber}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeOrders.length,
      transitions,
    });
  } catch (error: any) {
    console.error("[CRON_STATUS_UPDATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update order statuses" }, { status: 500 });
  }
}
