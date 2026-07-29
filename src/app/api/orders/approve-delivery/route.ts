import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email.service";
import { SmsService } from "@/services/sms.service";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token");

    if (!orderId || !token) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
            <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #c2410c; margin-top: 0;">Invalid Request</h2>
              <p>Missing required parameters for delivery approval.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    // Verify token
    const expectedToken = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "fallback-secret-key-1234")
      .update(orderId)
      .digest("hex");

    if (token !== expectedToken) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
            <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #c2410c; margin-top: 0;">Verification Failed</h2>
              <p>The security token is invalid or expired.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 403 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
            <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #c2410c; margin-top: 0;">Order Not Found</h2>
              <p>The requested order does not exist in the database.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 404 }
      );
    }

    // Check if already approved
    if (order.deliveryApproved || order.orderStatus === "delivered") {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
            <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #1e4a3a; font-family: serif; margin-top: 0; text-transform: uppercase;">Already Processed</h2>
              <p style="color: #6b7280; font-size: 14px;">Order <strong>${order.orderNumber}</strong> has already been marked as Delivered.</p>
              <div style="margin-top: 24px;">
                <span style="display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; background-color: #d1fae5; color: #065f46; border-radius: 20px;">DELIVERED</span>
              </div>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "delivered",
        deliveryApproved: true,
      },
    });

    // Send customer notifications
    try {
      await EmailService.sendOrderDeliveredEmail(updatedOrder, order.items);
    } catch (err) {
      console.error("[DELIVERY_NOTIFICATION_EMAIL_FAILED]", err);
    }

    try {
      await SmsService.sendCustomerDeliverySMS(updatedOrder);
    } catch (err) {
      console.error("[DELIVERY_NOTIFICATION_SMS_FAILED]", err);
    }

    return new NextResponse(
      `<html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
          <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #1e4a3a; font-family: serif; margin-top: 0; text-transform: uppercase;">Delivery Approved</h2>
            <p style="color: #6b7280; font-size: 14px;">Order <strong>${order.orderNumber}</strong> has been successfully marked as <strong>Delivered</strong>.</p>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-top: 16px;">The customer (<strong>${order.shippingName}</strong>) has been notified via Email & SMS.</p>
            <div style="margin-top: 24px;">
              <span style="display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; background-color: #d1fae5; color: #065f46; border-radius: 20px;">Delivered & Notified</span>
            </div>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("[DELIVERY_APPROVAL_ENDPOINT_ERROR]", error);
    return new NextResponse(
      `<html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8f5ef; color: #2b2b2b;">
          <div style="text-align: center; border: 1px solid #e5e7eb; padding: 40px; border-radius: 8px; background: white; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #c2410c; margin-top: 0;">Error</h2>
            <p>An internal error occurred while processing the approval request.</p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}
