const nodemailer = require("nodemailer");

async function sendTestOrderEmail() {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "hello@rootandharvest.in",
      pass: "Anaira@2019"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const order = {
    orderNumber: "RH-TEST-9999",
    id: "test-order-id-12345",
    paymentId: "pay_test_9999",
    createdAt: new Date(),
    shippingName: "Veena Patel",
    shippingPhone: "9666913832",
    shippingEmail: "rootandharvestindia@gmail.com",
    shippingAddress1: "Central Park Phase-1, Serilingampally",
    shippingAddress2: "Near Community Hall",
    shippingCity: "Hyderabad",
    shippingState: "Telangana",
    shippingPincode: "500019",
    total: 99
  };

  const items = [
    { name: "Groundnut Oil (Wood Pressed)", size: "1L", quantity: 1, price: 99 }
  ];

  const adminRecipients = [
    "rootandharvestindia@gmail.com",
    "vasu446@gmail.com"
  ];

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #2b2b2b; background-color: #f8f5ef;">
      <h2 style="color: #1e4a3a; font-family: serif; border-bottom: 2px solid #1e4a3a; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">Root & Harvest</h2>
      <h3 style="color: #b8903a; font-family: serif; font-style: italic;">
        New Order Received
      </h3>
      <p style="font-size: 14px; line-height: 1.5;">
        A new order has been placed and paid successfully. Details are below:
      </p>

      <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 4px 0; font-size: 13px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Database Order ID:</strong> ${order.id}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Payment ID:</strong> ${order.paymentId}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <h4 style="color: #1e4a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Delivery Address</h4>
      <p style="font-size: 13px; line-height: 1.5; margin-top: 0;">
        <strong>Name:</strong> ${order.shippingName}<br>
        <strong>Phone:</strong> ${order.shippingPhone}<br>
        <strong>Email:</strong> ${order.shippingEmail}<br>
        <strong>Address:</strong> ${order.shippingAddress1}<br>
        <strong>Address 2:</strong> ${order.shippingAddress2}<br>
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
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Groundnut Oil (Wood Pressed) (1L)</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">1</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. 99</td>
          </tr>
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

  console.log(`Sending order notification email to ${adminRecipients.join(", ")}...`);
  const info = await transporter.sendMail({
    from: '"Root & Harvest Admin" <hello@rootandharvest.in>',
    to: adminRecipients.join(", "),
    subject: `New Order Received - ${order.orderNumber}`,
    html
  });

  console.log(`SUCCESS! Email sent with message ID: ${info.messageId}`);
}

sendTestOrderEmail().catch(console.error);
