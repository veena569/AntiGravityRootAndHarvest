import { prisma } from "@/lib/db";

export class WhatsappMetaService {
  /**
   * Enqueues a message to be sent asynchronously in the background.
   */
  static queueMessage(recipient: string, message: string, messageType: string, orderId?: string) {
    this.sendMessageWithRetry(recipient, message, messageType, orderId)
      .catch((err) => console.error("[WHATSAPP_QUEUE_ERROR]", err));
  }

  /**
   * Core sender method with exponential backoff retries.
   */
  static async sendMessageWithRetry(
    recipient: string,
    message: string,
    messageType: string,
    orderId?: string
  ) {
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let responseText = "";
    let errMessage = "";

    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        // Retrieve config from DB
        const config = await prisma.whatsappConfig.findFirst();
        
        // Skip sending if alerts are explicitly disabled for customer or admin
        if (config) {
          if (messageType === "CUSTOMER" && !config.enableCustomerAlerts) {
            console.log(`[WhatsApp API] Customer notifications are disabled. Skipping.`);
            return { success: false, skipped: true };
          }
          if (messageType === "ADMIN" && !config.enableAdminAlerts) {
            console.log(`[WhatsApp API] Admin notifications are disabled. Skipping.`);
            return { success: false, skipped: true };
          }
        }

        const accessToken = config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!accessToken || !phoneNumberId) {
          throw new Error("Missing Meta WhatsApp Cloud API credentials (access token or phone number ID).");
        }

        // Validate and format phone number (ensure only digits, default to India country code 91 if 10 digits)
        let formattedPhone = recipient.replace(/\D/g, "");
        if (formattedPhone.length === 10) {
          formattedPhone = `91${formattedPhone}`;
        }

        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: {
              body: message,
            },
          }),
        });

        responseText = await response.text();

        if (response.ok) {
          success = true;
          console.log(`[WhatsApp API] Message sent successfully to ${formattedPhone} (Attempt ${attempt})`);
        } else {
          let parsedError = responseText;
          try {
            const errJson = JSON.parse(responseText);
            const errCode = errJson?.error?.code;
            if (errCode === 131030) {
              parsedError = `Meta App is in Development/Sandbox Mode. Recipient number ${formattedPhone} is not in Meta's allowed recipient list. Switch your Meta App to Live Mode on developers.facebook.com or add this number in Meta Developer Console.`;
            } else if (errCode === 190) {
              parsedError = "Meta Access Token Expired (OAuthException 190). Please update the WhatsApp Access Token in Admin Portal (/admin/whatsapp).";
            } else {
              parsedError = errJson?.error?.message || responseText;
            }
          } catch (e) {}
          throw new Error(parsedError);
        }
      } catch (err: any) {
        errMessage = err.message || String(err);
        console.warn(`[WhatsApp API] Attempt ${attempt} failed to send to ${recipient}: ${errMessage}`);
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 500; // 1s, 2s, etc.
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // Persist logs in database
    try {
      await prisma.whatsappLog.create({
        data: {
          orderId: orderId || null,
          recipient,
          messageType,
          status: success ? "SUCCESS" : "FAILED",
          metaResponse: responseText || null,
          errorMessage: success ? null : errMessage,
          retryCount: attempt - 1,
        },
      });
    } catch (logErr) {
      console.error("[WhatsApp Logging Error]", logErr);
    }

    return { success, responseText, errMessage };
  }

  /**
   * Enqueues order placement alerts for both Admin and Customer.
   */
  static async queueOrderPlacedNotification(orderId: string) {
    try {
      // Load full order details including items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        console.error(`[WhatsApp API Error] Order not found for notifications: ${orderId}`);
        return;
      }

      // 1. Send Admin Notification
      const config = await prisma.whatsappConfig.findFirst();
      const adminPhone = config?.businessNumber || process.env.WHATSAPP_BUSINESS_NUMBER || process.env.ADMIN_NOTIFICATION_PHONE;
      
      if (adminPhone) {
        const productList = order.items
          .map((item: any) => `- ${item.name} (${item.size}) x ${item.quantity}`)
          .join("\n");

        const address = `${order.shippingAddress1}${order.shippingAddress2 ? `, ${order.shippingAddress2}` : ""}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}`;
        const orderTime = new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const paymentStatus = order.paymentStatus === "paid" ? "PAID" : "COD (Pending)";

        const adminMessage = `🛒 NEW ORDER RECEIVED

Order ID: ${order.orderNumber}

Customer:
${order.shippingName}

Phone:
${order.shippingPhone}

Products:
${productList}

Total:
₹${order.total}

Payment:
${paymentStatus}

Shipping Address:
${address}

Order Time:
${orderTime}`;

        // Admin number can be comma-separated list
        const promises: Promise<any>[] = [];
        const adminNumbers = adminPhone.split(",");
        for (const num of adminNumbers) {
          const trimmedNum = num.trim();
          if (trimmedNum) {
            promises.push(this.sendMessageWithRetry(trimmedNum, adminMessage, "ADMIN", order.id));
          }
        }

        // 2. Send Customer Notification
        const hasOil = order.items.some((i: any) => i.name.toLowerCase().includes("oil"));
        const hasNonOil = order.items.some((i: any) => !i.name.toLowerCase().includes("oil"));

        let prepText = "Our team will freshly prepare your order and update you when it is dispatched.";
        if (hasOil && !hasNonOil) {
          prepText = "Our team will freshly prepare your wood-pressed oils and update you when your order is dispatched.";
        } else if (!hasOil && hasNonOil) {
          prepText = "Our team will carefully select and pack your farm-fresh items and update you when your order is dispatched.";
        } else if (hasOil && hasNonOil) {
          prepText = "Our team will freshly prepare and pack your items and update you when your order is dispatched.";
        }

        const customerMessage = `🌿 Thank you for choosing Root & Harvest.

We've received your order successfully.

Order ID:
${order.orderNumber}

Amount:
₹${order.total}

${prepText}

Thank you for supporting a small business ❤️`;

        promises.push(this.sendMessageWithRetry(order.shippingPhone, customerMessage, "CUSTOMER", order.id));
        await Promise.allSettled(promises);
      } else {
        console.warn("[WhatsApp API Warning] No admin phone number configured for order alerts.");
      }
    } catch (err) {
      console.error("[WhatsApp Queue Error]", err);
    }
  }

  /**
   * Enqueues order dispatch/shipping notification to customer.
   */
  static queueOrderShippedNotification(order: any) {
    const customerMessage = `🌿 Root & Harvest: Great news! Your order ${order.orderNumber} has been shipped. It is on its way to you.`;
    this.queueMessage(order.shippingPhone, customerMessage, "CUSTOMER", order.id);
  }

  /**
   * Enqueues order delivery notification to customer.
   */
  static queueOrderDeliveredNotification(order: any) {
    const customerMessage = `🌿 Root & Harvest: Your order ${order.orderNumber} has been delivered. Thank you for shopping with us! ❤️`;
    this.queueMessage(order.shippingPhone, customerMessage, "CUSTOMER", order.id);
  }

  /**
   * Enqueues promotional offer notifications to customer.
   */
  static queuePromotionNotification(recipient: string, promoMessage: string) {
    const formattedMessage = `🎁 Root & Harvest Offer:\n\n${promoMessage}\n\nShop now at rootandharvest.in`;
    this.queueMessage(recipient, formattedMessage, "PROMO");
  }
}
