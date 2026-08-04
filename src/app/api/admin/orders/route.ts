import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, orderStatus } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStatuses = ["placed", "processing", "shipped", "delivered"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus },
      include: {
        items: true,
      },
    });

    // Send WhatsApp notification if status changes to shipped or delivered
    if (orderStatus === "shipped" && existingOrder.orderStatus !== "shipped") {
      try {
        await WhatsappMetaService.queueOrderShippedNotification(updatedOrder);
      } catch (err) {
        console.error("[ADMIN_WHATSAPP_SHIPPED_ERROR]", err);
      }
    } else if (orderStatus === "delivered" && existingOrder.orderStatus !== "delivered") {
      try {
        await WhatsappMetaService.queueOrderDeliveredNotification(updatedOrder);
      } catch (err) {
        console.error("[ADMIN_WHATSAPP_DELIVERED_ERROR]", err);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("[ADMIN_ORDERS_PATCH]", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
