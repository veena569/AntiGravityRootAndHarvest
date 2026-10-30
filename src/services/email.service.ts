import nodemailer from "nodemailer";

export class EmailService {
  private static getSmtpUser() {
    return process.env.SMTP_USER || "hello@rootandharvest.in";
  }

  private static getTransporter() {
    const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = this.getSmtpUser();
    const pass = process.env.SMTP_PASS || "Anaira@2019";

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
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
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
      "vasu446@gmail.com",
      "admin@rootandharvest.in",
      "hello@rootandharvest.in"
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
        from: `"Root & Harvest Admin" <${this.getSmtpUser()}>`,
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
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_REMINDER_SUCCESS] Cart reminder email sent to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_REMINDER_ERROR] Failed to send to ${order.shippingEmail}`, err);
    }
  }

  private static buildDeliveryApprovalEmailBody(order: any, items: any[], approveUrl: string) {
    const itemsHtml = this.buildOrderItemsHtml(items);
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #b8903a; font-family: serif; font-style: italic;">
          Delivery Notification Approval Required
        </h3>
        <p style="font-size: 14px; line-height: 1.5;">
          Order <strong>${order.orderNumber}</strong> has been in "Out for Delivery" status for 12 hours. Please approve to mark it as Delivered and notify the customer.
        </p>

        <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Customer Name:</strong> ${order.shippingName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> ${order.shippingPhone}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${order.shippingEmail || "—"}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Date Placed:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        </div>

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
              <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right; border-top: 2px solid #1e4a3a;">Total Amount</td>
              <td style="padding: 12px; font-weight: bold; text-align: right; color: #1e4a3a; border-top: 2px solid #1e4a3a;">Rs. ${order.total}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${approveUrl}" style="background-color: #1e4a3a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
            Approve & Send Notification
          </a>
        </div>

        <div style="margin-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center;">
          Root & Harvest Co. • Hyderabad, Telangana
        </div>
      </div>
    `;
  }

  private static buildOrderDeliveredEmailBody(order: any, items: any[]) {
    const itemsHtml = this.buildOrderItemsHtml(items);
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #b8903a; font-family: serif; font-style: italic;">
          Your order has been delivered!
        </h3>
        <p style="font-size: 14px; line-height: 1.5;">
          Hello ${order.shippingName || "there"},<br><br>
          We are pleased to inform you that your Root & Harvest order has been delivered successfully. We hope you enjoy your premium unrefined wood-pressed items!
        </p>

        <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Payment ID:</strong> ${order.paymentId || "—"}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Delivery Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Delivered Items</h4>
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

  static async sendDeliveryApprovalEmail(order: any, items: any[], approveUrl: string) {
    const adminRecipients = [
      "rootandharvestindia@gmail.com"
    ];

    const transporter = this.getTransporter();
    const subject = `Delivery Notification Approval Request - Order ${order.orderNumber}`;
    const html = this.buildDeliveryApprovalEmailBody(order, items, approveUrl);

    if (!transporter) {
      console.log(`\n[MOCK ADMIN APPROVAL EMAIL] To: ${adminRecipients.join(", ")}\nSubject: ${subject}\nApprove URL: ${approveUrl}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest Admin" <${this.getSmtpUser()}>`,
        to: adminRecipients.join(", "),
        subject,
        html,
      });
      console.info(`[EMAIL_ADMIN_SUCCESS] Delivery approval email sent to: ${adminRecipients.join(", ")}`);
    } catch (err) {
      console.error("[EMAIL_ADMIN_ERROR] Failed to send admin delivery approval email", err);
    }
  }

  static async sendOrderDeliveredEmail(order: any, items: any[]) {
    if (!order.shippingEmail) {
      console.warn("[EMAIL_DELIVERED_WARNING] No customer email address available on order.");
      return;
    }

    const transporter = this.getTransporter();
    const subject = `Your order has been delivered! - ${order.orderNumber}`;
    const html = this.buildOrderDeliveredEmailBody(order, items);

    if (!transporter) {
      console.log(`\n[MOCK CUSTOMER DELIVERED EMAIL] To: ${order.shippingEmail}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_CUSTOMER_SUCCESS] Delivery confirmation email sent to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_CUSTOMER_ERROR] Failed to send to ${order.shippingEmail}`, err);
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
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
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

  static async sendPasswordResetEmail(email: string, name: string | null | undefined, resetUrl: string) {
    const transporter = this.getTransporter();
    const subject = "Reset your Root & Harvest password";
    const recipientName = name ? name : "Customer";
    const html = `
      <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #1e4a3a; font-family: serif; margin-top: 16px;">Password Reset Request</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">
          Hello ${recipientName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">
          We received a request to reset your password for your Root & Harvest account. Click the secure link below to choose a new password:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #1e4a3a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563;">
          This link will expire in <strong>1 hour</strong>. If you did not make this request, you can safely disregard this email—your account remains safe.
        </p>
        <p style="font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 24px;">
          Root & Harvest — Farm Fresh & Pure Groceries | <a href="https://rootandharvest.in" style="color: #1e4a3a;">rootandharvest.in</a>
        </p>
      </div>
    `;

    if (!transporter) {
      console.log(`\n[MOCK PASSWORD RESET EMAIL] To: ${email}\nSubject: ${subject}\nReset Link: ${resetUrl}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: email,
        subject,
        html,
      });
      console.info(`[EMAIL_PASSWORD_RESET_SUCCESS] Reset link sent to ${email}`);
    } catch (err) {
      console.error(`[EMAIL_PASSWORD_RESET_ERROR] Failed to send to ${email}`, err);
    }
  }

  static async sendEmailVerificationEmail(email: string, name: string | null | undefined, verifyUrl: string) {
    const transporter = this.getTransporter();
    const subject = "Verify your Root & Harvest account";
    const recipientName = name ? name : "Customer";
    const html = `
      <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
        <h3 style="color: #1e4a3a; font-family: serif; margin-top: 16px;">Welcome to Root & Harvest</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">
          Hello ${recipientName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">
          Thank you for creating an account with Root & Harvest. Please verify your email address by clicking the link below:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}" style="background-color: #1e4a3a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #4b5563;">
          This link will expire in <strong>24 hours</strong>. If you did not create this account, please ignore this email.
        </p>
        <p style="font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 24px;">
          Root & Harvest — Farm Fresh & Pure Groceries | <a href="https://rootandharvest.in" style="color: #1e4a3a;">rootandharvest.in</a>
        </p>
      </div>
    `;

    if (!transporter) {
      console.log(`\n[MOCK EMAIL VERIFY] To: ${email}\nSubject: ${subject}\nVerify Link: ${verifyUrl}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: email,
        subject,
        html,
      });
      console.info(`[EMAIL_VERIFY_SUCCESS] Verification email sent to ${email}`);
    } catch (err) {
      console.error(`[EMAIL_VERIFY_ERROR] Failed to send to ${email}`, err);
    }
  }

  static async sendPaymentSuccessEmail(order: any, items: any[], paymentId: string) {
    if (!order.shippingEmail) {
      console.warn("[EMAIL_PAYMENT_SUCCESS_WARN] No customer email available.");
      return;
    }
    const transporter = this.getTransporter();
    const subject = `Payment Received: Order ${order.orderNumber} - Root & Harvest`;
    const itemsHtml = this.buildOrderItemsHtml(items);
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase;">Root & Harvest</h2>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
          <h3 style="color: #065f46; margin: 0 0 4px 0; font-size: 16px;">Payment Successful</h3>
          <p style="color: #047857; margin: 0; font-size: 13px;">We received your online payment of <strong>Rs. ${order.total}</strong> (Ref: ${paymentId}).</p>
        </div>
        <p style="font-size: 14px; line-height: 1.5;">Dear ${order.shippingName},</p>
        <p style="font-size: 14px; line-height: 1.5;">
          Your payment for order <strong>#${order.orderNumber}</strong> has been successfully processed. We are preparing your farm-fresh groceries.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #ffffff; border-radius: 4px; overflow: hidden;">
          <thead>
            <tr style="background-color: #1e4a3a; color: #ffffff;">
              <th style="padding: 10px 12px; text-align: left; font-size: 13px;">Item</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 13px;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 13px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb; font-weight: bold;">
              <td colspan="2" style="padding: 10px 12px; text-align: right;">Total Amount:</td>
              <td style="padding: 10px 12px; text-align: right; color: #1e4a3a;">Rs. ${order.total}</td>
            </tr>
          </tfoot>
        </table>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
          Deliver to: ${order.shippingAddress1}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}<br>
          Phone: ${order.shippingPhone}
        </p>
      </div>
    `;

    if (!transporter) {
      console.log(`\n[MOCK PAYMENT SUCCESS EMAIL] To: ${order.shippingEmail}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_PAYMENT_SUCCESS] Sent to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_PAYMENT_ERROR] Failed to send to ${order.shippingEmail}`, err);
    }
  }

  static async sendOrderStatusUpdateEmail(order: any, items: any[], newStatus: string) {
    if (!order.shippingEmail) return;
    const transporter = this.getTransporter();

    let statusTitle = "Order Update";
    let statusMessage = "Your order status has been updated.";
    if (newStatus === "shipped") {
      statusTitle = "Your order has been shipped!";
      statusMessage = "Your farm-fresh items are on their way to you.";
    } else if (newStatus === "out_for_delivery") {
      statusTitle = "Your order is out for delivery!";
      statusMessage = "Our delivery partner is in your area and will arrive shortly.";
    } else if (newStatus === "delivered") {
      return this.sendOrderDeliveredEmail(order, items);
    } else if (newStatus === "cancelled") {
      statusTitle = "Your order has been cancelled";
      statusMessage = "Your order has been cancelled. If payment was completed, your refund is being processed.";
    }

    const subject = `${statusTitle} - Order ${order.orderNumber} (Root & Harvest)`;
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
        <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase;">Root & Harvest</h2>
        <h3 style="color: #1e4a3a; font-family: serif;">${statusTitle}</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">Dear ${order.shippingName},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #374151;">${statusMessage}</p>
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; margin: 16px 0; font-size: 13px;">
          <strong>Order Number:</strong> #${order.orderNumber}<br>
          <strong>Status:</strong> <span style="text-transform: capitalize; color: #1e4a3a; font-weight: 600;">${newStatus.replace(/_/g, " ")}</span><br>
          <strong>Total:</strong> Rs. ${order.total}<br>
          <strong>Delivery To:</strong> ${order.shippingAddress1}, ${order.shippingCity} - ${order.shippingPincode}
        </div>
        <p style="font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 24px;">
          Questions? Reply to this email or reach us at <a href="mailto:hello@rootandharvest.in" style="color: #1e4a3a;">hello@rootandharvest.in</a>.
        </p>
      </div>
    `;

    if (!transporter) {
      console.log(`\n[MOCK STATUS EMAIL] To: ${order.shippingEmail}\nSubject: ${subject}\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Root & Harvest" <${this.getSmtpUser()}>`,
        to: order.shippingEmail,
        subject,
        html,
      });
      console.info(`[EMAIL_STATUS_SUCCESS] Sent ${newStatus} email to ${order.shippingEmail}`);
    } catch (err) {
      console.error(`[EMAIL_STATUS_ERROR] Failed to send to ${order.shippingEmail}`, err);
    }
  }
}
