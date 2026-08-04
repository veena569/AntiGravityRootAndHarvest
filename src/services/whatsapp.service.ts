import { prisma } from "@/lib/db";

export class WhatsappService {
  static async sendCustomerWhatsApp(phone: string, message: string) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

      // Clean up phone number and format to E.164 (e.g. +91XXXXXXXXXX)
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (!formattedPhone.startsWith("+") && formattedPhone.length > 10) {
        formattedPhone = `+${formattedPhone}`;
      } else if (phone.startsWith("+")) {
        formattedPhone = `+${formattedPhone}`;
      }

      console.log(`[WhatsApp] Preparing to send message to ${formattedPhone}`);

      if (!accountSid || !authToken || !fromNumber) {
        console.log(`[WhatsApp SIMULATION] Credentials not configured in environment.`);
        console.log(`[WhatsApp SIMULATION] To: ${formattedPhone}`);
        console.log(`[WhatsApp SIMULATION] Message: "${message}"`);
        return { success: true, simulated: true };
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("From", fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`);
      params.append("To", `whatsapp:${formattedPhone}`);
      params.append("Body", message);

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const responseText = await response.text();
      console.log(`[WhatsApp] Twilio response: ${responseText}`);

      if (response.ok) {
        console.log(`[WhatsApp] Notification sent successfully to ${formattedPhone}`);
        return { success: true, response: JSON.parse(responseText) };
      } else {
        console.error(`[WhatsApp ERROR] Twilio failed: ${responseText}`);
        return { success: false, error: responseText };
      }
    } catch (error: any) {
      console.error(`[WhatsApp ERROR] Failed: ${error.message || error}`);
      return { success: false, error: error.message || error };
    }
  }

  static async sendOrderPlacedNotification(order: any) {
    const message = `Root & Harvest: Thank you! Your order ${order.orderNumber} for Rs. ${order.total} has been successfully placed. We will notify you when it ships.`;
    return this.sendCustomerWhatsApp(order.shippingPhone, message);
  }

  static async sendOrderShippedNotification(order: any) {
    const message = `Root & Harvest: Great news! Your order ${order.orderNumber} has been shipped. It is on its way to you.`;
    return this.sendCustomerWhatsApp(order.shippingPhone, message);
  }

  static async sendOrderDeliveredNotification(order: any) {
    const message = `Root & Harvest: Your order ${order.orderNumber} has been delivered. Thank you for shopping with Root & Harvest!`;
    return this.sendCustomerWhatsApp(order.shippingPhone, message);
  }
}
