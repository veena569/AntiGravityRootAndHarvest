const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendFinalTest() {
  const config = await prisma.whatsappConfig.findFirst();
  console.log('Sending live production message via Phone ID:', config.phoneNumberId);
  
  const timeStr = new Date().toLocaleTimeString();
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
  
  const res = await fetch(url, {
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
      text: {
        body: `🌿 Root & Harvest Official Order Alert [Sent at ${timeStr}]:\n\nYour permanent System User Token is active and fully verified for +91 91216 03832! 🚀`
      }
    })
  });

  const data = await res.json();
  console.log('Meta API Response:', JSON.stringify(data, null, 2));
}

sendFinalTest().catch(console.error).finally(() => prisma.$disconnect());
