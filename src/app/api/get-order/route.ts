export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // 1. Fetch the order with its line items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Guest Order access:
    // If the order has no associated user account (guest checkout), allow viewing directly
    // by the secure unguessable CUID order ID.
    if (!order.userId) {
      return NextResponse.json(order);
    }

    // 3. User Order access:
    // Check if the user is authenticated as the order owner or admin
    const token = cookies().get(authConfig.cookies.accessToken)?.value;
    let isAuthenticatedOwner = false;
    let isAdmin = false;

    if (token) {
      try {
        const payload = await JwtService.verifyToken(token);
        if (payload && payload.sub) {
          if (payload.sub === order.userId) {
            isAuthenticatedOwner = true;
          }
          if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN") {
            isAdmin = true;
          }
        }
      } catch (e) {
        // Token invalid or expired
      }
    }

    if (isAuthenticatedOwner || isAdmin) {
      return NextResponse.json(order);
    }

    // Allow viewing recent order confirmation directly via the secure unguessable CUID link within 24 hours of creation
    // (e.g. if customer checked out as guest using an email that already had an account, or right after checkout redirect)
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    const isRecentOrder = orderAgeMs < 24 * 60 * 60 * 1000; // 24 hours

    if (isRecentOrder) {
      return NextResponse.json(order);
    }

    // Otherwise, require authentication to view older orders tied to registered accounts
    return NextResponse.json(
      { error: "Authentication required to view this order" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[GET_ORDER_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
