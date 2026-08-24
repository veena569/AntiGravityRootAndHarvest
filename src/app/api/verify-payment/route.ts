export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { EmailService } from "@/services/email.service";
import { SmsService } from "@/services/sms.service";
import { WhatsappMetaService } from "@/services/whatsapp-meta.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, db_order_id } = body;

    // Validate presence of all required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !db_order_id) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "xPLKgZ5CBpk3DlC8Bqw3w41Y";
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay server configuration error" }, { status: 500 });
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    let isVerified = expectedSignature === razorpay_signature;

    if (!isVerified) {
      console.warn(`[PAYMENT_VERIFICATION_FAILED] Signature hash mismatch. Attempting API fallback verification from Razorpay server...`);
      try {
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TEIC4Fxh9xf0S0";
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: {
            "Authorization": `Basic ${basicAuth}`
          }
        });

        if (rzpRes.ok) {
          const paymentInfo = await rzpRes.json();
          if (paymentInfo.status === "captured" || paymentInfo.status === "authorized") {
            if (paymentInfo.order_id === razorpay_order_id) {
              isVerified = true;
              console.info(`[PAYMENT_VERIFICATION_SUCCESS] API Fallback verification succeeded for payment: ${razorpay_payment_id}`);
            }
          }
        }
      } catch (apiErr) {
        console.error("[PAYMENT_VERIFICATION_API_FALLBACK_FAILED]", apiErr);
      }
    }

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Signatures match — Update order status in the database
    const updatedOrder = await prisma.order.update({
      where: { id: db_order_id },
      data: {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
      },
    });

    console.info(`[PAYMENT_SUCCESS] Order ${updatedOrder.orderNumber} successfully marked as paid.`);
    console.log(`[ORDER] Order created: ${updatedOrder.id}`);

    // 1. Save address to User's Address table for profile and address book (if user checked saveAddress)
    if (updatedOrder.userId && updatedOrder.saveAddress) {
      try {
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: updatedOrder.userId,
            name: updatedOrder.shippingName,
            phone: updatedOrder.shippingPhone,
            addressLine1: updatedOrder.shippingAddress1,
            addressLine2: updatedOrder.shippingAddress2,
            city: updatedOrder.shippingCity,
            state: updatedOrder.shippingState,
            pincode: updatedOrder.shippingPincode,
            type: updatedOrder.addressType,
          },
        });

        if (!existingAddress) {
          const hasDefault = await prisma.address.findFirst({
            where: { userId: updatedOrder.userId, isDefault: true },
          });

          await prisma.address.create({
            data: {
              userId: updatedOrder.userId,
              name: updatedOrder.shippingName,
              phone: updatedOrder.shippingPhone,
              addressLine1: updatedOrder.shippingAddress1,
              addressLine2: updatedOrder.shippingAddress2,
              city: updatedOrder.shippingCity,
              state: updatedOrder.shippingState,
              pincode: updatedOrder.shippingPincode,
              type: updatedOrder.addressType,
              isDefault: !hasDefault,
            },
          });
          console.info(`[ADDRESS_SAVED] Saved new address (Type: ${updatedOrder.addressType}) to DB for user ${updatedOrder.userId}`);
        }
      } catch (addrErr) {
        console.error("[ADDRESS_SAVE_ERROR]", addrErr);
      }
    }

    // Fetch order items for the email notification
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: db_order_id },
    });

    // 2. Send SMS notifications via Fast2SMS
    if (process.env.FAST2SMS_API_KEY) {
      try {
        // Customer notification
        await SmsService.sendCustomerOrderSMS(updatedOrder);

        // Admin notifications
        await SmsService.sendAdminOrderSMS(updatedOrder);
      } catch (smsErr) {
        console.error("[SMS_NOTIFICATION_ERROR]", smsErr);
      }
    }

    // 2.5 Send WhatsApp notification
    try {
      await WhatsappMetaService.queueOrderPlacedNotification(updatedOrder.id);
    } catch (waErr) {
      console.error("[PAYMENT_WHATSAPP_NOTIFICATION_FAILED]", waErr);
    }

    // 3. Send email notifications to customer and admins (failsafe - will log but not crash the order completion)
    try {
      await EmailService.sendOrderConfirmationEmail(updatedOrder, orderItems);
    } catch (emailErr) {
      console.error("[CUSTOMER_EMAIL_NOTIFICATION_FAILED]", emailErr);
    }

    try {
      await EmailService.sendOrderAdminNotification(updatedOrder, orderItems);
    } catch (emailErr) {
      console.error("[ADMIN_EMAIL_NOTIFICATION_FAILED]", emailErr);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("[PAYMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal payment verification error" }, { status: 500 });
  }
}
