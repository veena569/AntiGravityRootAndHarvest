import nodemailer from "nodemailer";

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn(
        "[EMAIL_SERVICE_WARNING] SMTP credentials are not fully configured in environment. Emails will be logged to console."
      );
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private static buildOrderItemsHtml(items: any[]) {
    return items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name} (${item.size})</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${item.price}</td>
          </tr>`
      )
      .join("");
  }

  private static buildEmailBody(order: any, items: any[], isForAdmin: boolean) {
    const itemsHtml = this.buildOrderItemsHtml(items);
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #b8903a; font-family: serif; font-style: italic;">
          ${isForAdmin ? "New Order Received" : "Thank you for your order!"}
        </h3>
        <p style="font-size: 14px; line-height: 1.5;">
          ${isForAdmin ? "A new order has been placed and paid successfully. Details are below:" : "Your order has been successfully placed and is being processed. Here is your receipt:"}
        </p>

        <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Database Order ID:</strong> ${order.id}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Payment ID:</strong> ${order.paymentId || "—"}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Delivery Address</h4>
        <p style="font-size: 13px; line-height: 1.5; margin-top: 0;">
          <strong>Name:</strong> ${order.shippingName}<br>
          <strong>Phone:</strong> ${order.shippingPhone}<br>
          <strong>Email:</strong> ${order.shippingEmail || "—"}<br>
          <strong>Address:</strong> ${order.shippingAddress1}<br>
          ${order.shippingAddress2 ? `<strong>Address 2:</strong> ${order.shippingAddress2}<br>` : ""}
          <strong>City/State/Pincode:</strong> ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}
        </p>

        <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Items Ordered</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #1e4a3a; color: #ffffff;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center; width: 80px;">Qty</th>
              <th style="padding: 10px; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right; border-top: 2px solid #1e4a3a;">Total Amount Paid</td>
              <td style="padding: 12px; font-weight: bold; text-align: right; color: #1e4a3a; border-top: 2px solid #1e4a3a;">Rs. ${order.total}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center;">
          Root & Harvest Co. • Hyderabad, Telangana
        </div>
      </div>
    `;
  }

  static async sendOrderConfirmationEmail(order: any, items: any[]) {
    if (!order.shippingEmail) {
      console.warn("[EMAIL_CONFIRMATION_WARNING] No customer email address available on order.");
      return;
    }

    const transporter = this.getTransporter();
    const subject = `Order Confirmation - ${order.orderNumber}`;
    const html = this.buildEmailBody(order, items, false);

    if (!transporter) {
      console.log(`\n[MOCK CUSTOMER EMAIL] To: ${order.shippingEmail}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${process.env.SMTP_USER}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_CUSTOMER_SUCCESS] Confirmation email sent to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_CUSTOMER_ERROR] Failed to send to ${order.shippingEmail}`, err);
    }
  }

  static async sendOrderAdminNotification(order: any, items: any[]) {
    // Array of admin emails (easily expandable in the future)
    const adminRecipients = [
      "rootandharvestindia@gmail.com",
      "vasu446@gmail.com"
    ];

    const transporter = this.getTransporter();
    // Using orderNumber for subject
    const subject = `New Order Received - ${order.orderNumber}`;
    const html = this.buildEmailBody(order, items, true);

    if (!transporter) {
      console.log(`\n[MOCK ADMIN EMAIL] To: ${adminRecipients.join(", ")}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest Admin" <${process.env.SMTP_USER}>`,
        to: adminRecipients.join(", "),
        subject,
        html,
      });
      console.info(`[EMAIL_ADMIN_SUCCESS] Order notification emails sent to: ${adminRecipients.join(", ")}`);
    } catch (err) {
      console.error("[EMAIL_ADMIN_ERROR] Failed to send admin emails", err);
    }
  }

  private static buildCartReminderEmailBody(order: any, items: any[]) {
    const itemsHtml = this.buildOrderItemsHtml(items);
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #b8903a; font-family: serif; font-style: italic;">
          Did you forget something?
        </h3>
        <p style="font-size: 14px; line-height: 1.5;">
          Hello ${order.shippingName || "there"},<br><br>
          We noticed you left some items in your shopping cart. Don't worry, we've saved your selection so you can easily complete your purchase!
        </p>

        <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Your Cart Items</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #1e4a3a; color: #ffffff;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center; width: 80px;">Qty</th>
              <th style="padding: 10px; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right; border-top: 2px solid #1e4a3a;">Total Value</td>
              <td style="padding: 12px; font-weight: bold; text-align: right; color: #1e4a3a; border-top: 2px solid #1e4a3a;">Rs. ${order.total}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://rootandharvest.in"}/cart" style="background-color: #1e4a3a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
            Return to Cart & Checkout
          </a>
        </div>

        <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px;">
          If you have any questions or need help with your order, feel free to reply directly to this email or contact support.
        </p>

        <div style="margin-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center;">
          Root & Harvest Co. • Hyderabad, Telangana
        </div>
      </div>
    `;
  }

  static async sendCartReminderEmail(order: any, items: any[]) {
    if (!order.shippingEmail) {
      console.warn("[EMAIL_REMINDER_WARNING] No customer email address available on order.");
      return;
    }

    const transporter = this.getTransporter();
    const subject = `Your cart is waiting! - ${order.orderNumber}`;
    const html = this.buildCartReminderEmailBody(order, items);

    if (!transporter) {
      console.log(`\n[MOCK CUSTOMER REMINDER EMAIL] To: ${order.shippingEmail}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${process.env.SMTP_USER}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_REMINDER_SUCCESS] Cart reminder email sent to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_REMINDER_ERROR] Failed to send to ${order.shippingEmail}`, err);
    }
  }

  static async sendEmailOtp(email: string, code: string) {
    const transporter = this.getTransporter();
    const subject = `Your Root & Harvest verification code is: ${code}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase;">Root & Harvest</h2>
        <h3>Verification Code</h3>
        <p style="font-size: 14px; line-height: 1.5;">
          Please use the following 6-digit verification code to log in to your Root & Harvest account:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #1e4a3a; background-color: #ffffff; padding: 12px 24px; border: 1px solid #e5e7eb; border-radius: 4px;">
            ${code}
          </span>
        </div>
        <p style="font-size: 12px; color: #6b7280;">
          This code is valid for 5 minutes. If you did not request this code, please ignore this email.
        </p>
      </div>
    `;

    if (!transporter) {
      console.log(`\n[MOCK EMAIL OTP] To: ${email}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      console.info(`[EMAIL_OTP_SUCCESS] Verification code sent to ${email}`);
    } catch (err) {
      console.error(`[EMAIL_OTP_ERROR] Failed to send to ${email}`, err);
      throw err;
    }
  }
}
