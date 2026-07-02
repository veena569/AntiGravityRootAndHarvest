export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";

export async function POST(req: Request) {
  try {
    const token = cookies().get(authConfig.cookies.accessToken)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await JwtService.verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "INR", cartItems, shippingData } = body;

    // Generate a unique order number
    const orderNumber = `RH-${Math.floor(Math.random() * 90000) + 10000}`;

    // 1. Create the Order in the database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: payload.sub,
        total: amount,
        paymentStatus: "pending",
        orderStatus: "placed",
        shippingName: shippingData.name,
        shippingPhone: shippingData.phone,
        shippingAddress1: shippingData.addressLine1,
        shippingAddress2: shippingData.addressLine2 || null,
        shippingCity: shippingData.city,
        shippingState: shippingData.state,
        shippingPincode: shippingData.pincode,
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.product.id,
            name: item.product.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 2. In a real implementation with Cashfree:
    // const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-client-id": process.env.CASHFREE_APP_ID!,
    //     "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    //     "x-api-version": "2023-08-01",
    //   },
    //   body: JSON.stringify({ ... })
    // });
    
    // const cashfreeOrder = await response.json();

    // 3. Mock Cashfree Response
    const mockOrder = {
      order_id: order.id,
      order_number: order.orderNumber,
      order_amount: amount,
      order_currency: currency,
      payment_session_id: `session_${Date.now()}_mock`
    };

    return NextResponse.json(mockOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
