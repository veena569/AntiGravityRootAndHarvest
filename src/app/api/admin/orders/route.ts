import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";
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

    let orders: any[] = [];
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        orders = await prisma.order.findMany({
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        try {
          await prisma.$executeRawUnsafe(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = 'insforge'
              AND pid <> pg_backend_pid()
              AND (state = 'idle' OR state = 'idle in transaction');
          `);
        } catch {}
        await new Promise((res) => setTimeout(res, 800));
      }
    }

    if (lastError && orders.length === 0) {
      console.error("[ADMIN_ORDERS_GET_DB_ERROR]", lastError);
      return NextResponse.json({ error: "Database busy. Please click Retry." }, { status: 500 });
    }

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
