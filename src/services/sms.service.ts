import { prisma } from "@/lib/db";

export class SmsService {
  static async sendAdminOrderSMS(order: any) {
    try {
      // 1. Prevent duplicate SMS notifications
      if (order.smsNotificationSent) {
        console.log(`[SMS] Admin SMS already sent for order ${order.orderNumber}. Skipping.`);
        return;
      }

      const apiKey = process.env.FAST2SMS_API_KEY;
      const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE;

      if (!apiKey || !adminPhone) {
        console.warn("[SMS WARNING] FAST2SMS_API_KEY or ADMIN_NOTIFICATION_PHONE is not configured in environment.");
        return;
      }

      console.log(`[SMS] Sending admin SMS`);

      // Determine payment method
      const paymentMethod = order.paymentStatus === "paid" ? "Online" : "COD";

      // Formulate message exactly as requested
      const message = `Root & Harvest: New order ${order.orderNumber} received. Customer: ${order.shippingName}. Amount: Rs.${order.total}. Payment: ${paymentMethod}. Please check the admin dashboard.`;

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: message,
          numbers: adminPhone,
        }),
      });

      const responseText = await response.text();
      console.log(`[SMS] FAST2SMS response: ${responseText}`);

      let responseJson: any = {};
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseErr) {}

      // Fast2SMS returns { return: true } on success
      if (response.ok && responseJson.return === true) {
        // Update database to mark flag as true
        await prisma.order.update({
          where: { id: order.id },
          data: { smsNotificationSent: true },
        });
        console.log(`[SMS] Admin SMS sent successfully`);
      } else {
        console.error(`[SMS ERROR] FAST2SMS failed: ${responseText}`);
      }
    } catch (error: any) {
      console.error(`[SMS ERROR] FAST2SMS failed: ${error.message || error}`);
    }
  }
}
