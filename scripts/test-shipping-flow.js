const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderLifecycle() {
  const config = await prisma.whatsappConfig.findFirst();
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  const orderNum = `RH-88412`;

  console.log('\n--- 1. Testing ORDER SHIPPED Alert ---');
  const shippedMsg = `🌿 Root & Harvest: Great news! Your order ${orderNum} has been shipped via BlueDart (Tracking ID: BD9821443). It is on its way to you! 🚚`;
  
  const res1 = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919666913832",
      type: "text",
      text: { body: shippedMsg }
    })
  });
  console.log('Shipped Alert Status:', res1.status, await res1.json());

  console.log('\n--- 2. Testing ORDER DELIVERED Alert ---');
  const deliveredMsg = `🌿 Root & Harvest: Your order ${orderNum} has been delivered successfully! Thank you for shopping with us ❤️`;
  
  const res2 = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919666913832",
      type: "text",
      text: { body: deliveredMsg }
    })
  });
  console.log('Delivered Alert Status:', res2.status, await res2.json());
}

testOrderLifecycle().catch(console.error).finally(() => prisma.$disconnect());
