const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runLiveOrderTest() {
  try {
    const config = await prisma.whatsappConfig.findFirst();
    if (!config || !config.accessToken || !config.phoneNumberId) {
      console.error('Missing WhatsApp config');
      return;
    }

    const orderNumber = `ORDER-${Math.floor(100000 + Math.random() * 900000)}`;
    const timeStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`\n==================================================`);
    console.log(`🚀 TRIGGERING LIVE ORDER TEST FOR NUMBER: ${orderNumber}`);
    console.log(`Phone ID: ${config.phoneNumberId}`);
    console.log(`==================================================\n`);

    const customerMessage = `🌿 Thank you for choosing Root & Harvest!

We have received your order successfully.

📦 Order ID: ${orderNumber}
💰 Total Amount: ₹1,299.00
🕒 Time: ${timeStr}

Items Ordered:
• Wood-Pressed Groundnut Oil (1 Litre) x 2
• Cold-Pressed Sesame Oil (1 Litre) x 1

Our team will freshly prepare your wood-pressed oils and notify you as soon as your package is dispatched.

Thank you for supporting a small business ❤️`;

    const adminMessage = `🛒 NEW LIVE ORDER RECEIVED

Order ID: ${orderNumber}
Time: ${timeStr}

Customer Details:
Name: Veena Patel
Phone: 9666913832
Email: hello@rootandharvest.in

Items:
- Wood-Pressed Groundnut Oil (1L) x 2
- Cold-Pressed Sesame Oil (1L) x 1

Total Amount: ₹1,299.00
Payment Status: PAID (Razorpay)

Shipping Address:
Flat 402, Green Acres, Jubilee Hills, Hyderabad, Telangana - 500081`;

    const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

    // 1. Send Customer Order Confirmation to 9666913832
    console.log('Sending Customer Notification to 9666913832...');
    const res1 = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "919666913832",
        type: "text",
        text: { body: customerMessage }
      })
    });
    const data1 = await res1.json();
    console.log('Customer Alert Result:', JSON.stringify(data1, null, 2));

    // 2. Send Admin Notification to 9121603832
    console.log('\nSending Admin Alert to 9121603832...');
    const res2 = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "919121603832",
        type: "text",
        text: { body: adminMessage }
      })
    });
    const data2 = await res2.json();
    console.log('Admin Alert Result:', JSON.stringify(data2, null, 2));

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runLiveOrderTest().catch(console.error).finally(() => prisma.$disconnect());
