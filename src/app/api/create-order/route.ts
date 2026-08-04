export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";
import Razorpay from "razorpay";
import { SmsService } from "@/services/sms.service";
import { EmailService } from "@/services/email.service";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", cartItems, shippingData } = body;

    const amountInPaise = Math.round(amount * 100);
    if (!amount || amountInPaise < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise (1 INR)" }, { status: 400 });
    }

    let userId: string | null = null;
    const token = cookies().get(authConfig.cookies.accessToken)?.value;
    if (token) {
      try {
        const payload = await JwtService.verifyToken(token);
        if (payload && payload.sub) {
          userId = payload.sub;
        }
      } catch (e) {
        // Token is invalid/expired — treat as guest
      }
    }

    // Guest checkout fallback: find or create a user by phone number so data is stored in DB
    if (!userId && shippingData?.phone) {
      const rawPhone = shippingData.phone.replace(/\D/g, "");
      const formattedPhone = rawPhone.length === 10 ? `+91${rawPhone}` : `+${rawPhone}`;
      
      let user = await prisma.user.findFirst({
        where: { phone: formattedPhone }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: shippingData.name,
            phone: formattedPhone,
            role: "CUSTOMER"
          }
        });
      }
      userId = user.id;
    }

    // Generate a unique order number
    const orderNumber = `RH-${Math.floor(Math.random() * 90000) + 10000}`;

    // 1. Create the Order in the local database (marked as pending)
    const isDev = process.env.NODE_ENV !== "production";
    const isCOD = isDev && body.paymentMethod === "COD";

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId,
        total: amount,
        paymentStatus: isCOD ? "cod" : "pending",
        orderStatus: "placed",
        shippingName: shippingData.name,
        shippingPhone: shippingData.phone,
        shippingEmail: shippingData.email,
        shippingAddress1: shippingData.addressLine1,
        shippingAddress2: shippingData.addressLine2 || null,
        shippingCity: shippingData.city,
        shippingState: shippingData.state,
        shippingPincode: shippingData.pincode,
        saveAddress: typeof shippingData.saveAddress === "boolean" ? shippingData.saveAddress : true,
        addressType: shippingData.addressType || "Home",
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

    console.log(`[ORDER] Order created: ${order.id}`);

    // Auto-save address to User's Address table (if user checked saveAddress)
    if (userId && (typeof shippingData.saveAddress === "boolean" ? shippingData.saveAddress : true)) {
      try {
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: userId,
            addressLine1: shippingData.addressLine1,
            city: shippingData.city,
            pincode: shippingData.pincode,
          },
        });

        if (!existingAddress) {
          await prisma.address.create({
            data: {
              userId: userId,
              name: shippingData.name,
              phone: shippingData.phone,
              addressLine1: shippingData.addressLine1,
              addressLine2: shippingData.addressLine2 || null,
              city: shippingData.city,
              state: shippingData.state,
              pincode: shippingData.pincode,
              type: shippingData.addressType || "Home",
              isDefault: false,
            },
          });
          console.log(`[ADDRESS_AUTO_SAVE] Saved shipping address for user: ${userId}`);
        }
      } catch (addressErr) {
        console.error("[ADDRESS_AUTO_SAVE_FAILED]", addressErr);
      }
    }



    // If Cash on Delivery, send the SMS immediately and return success (skipping Razorpay)
    if (isCOD) {
      await SmsService.sendAdminOrderSMS(order);
      try {
        await WhatsappMetaService.queueOrderPlacedNotification(order.id);
      } catch (waErr) {
        console.error("[COD_WHATSAPP_NOTIFICATION_FAILED]", waErr);
      }
      return NextResponse.json({
        success: true,
        db_order_id: order.id,
        order_number: order.orderNumber,
        payment_method: "COD"
      });
    }

    // 2. Call Razorpay API to create order
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: order.id,
      });

      return NextResponse.json({
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        db_order_id: order.id,
        order_number: order.orderNumber
      });
    } catch (err: any) {
      console.error("[RAZORPAY_ORDER_CREATE_ERROR]", err);
      // Handle key/auth failures
      if (err.statusCode === 401 || (err.code === "BAD_REQUEST_ERROR" && err.description?.toLowerCase().includes("api key"))) {
        return NextResponse.json({ error: "Unauthorized: Invalid Razorpay API Key or Secret" }, { status: 401 });
      }
      return NextResponse.json({ error: err.description || "Failed to create order on Razorpay" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
