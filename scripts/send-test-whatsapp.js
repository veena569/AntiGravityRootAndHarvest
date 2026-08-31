const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendTestMessage(recipientPhone) {
  try {
    const config = await prisma.whatsappConfig.findFirst();
    if (!config || !config.accessToken || !config.phoneNumberId) {
      console.error('Missing WhatsApp config in DB!');
      return;
    }

    let formattedPhone = recipientPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    console.log(`Sending test WhatsApp message to +${formattedPhone}...`);
    console.log(`Using Phone Number ID: ${config.phoneNumberId}`);

    const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
    
    const testPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        body: "🌿 Root & Harvest Test Alert:\n\nHello! This is a test notification from Root & Harvest to confirm your WhatsApp Business API integration is working perfectly. 🎉"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log('\n--- META API RESPONSE ---');
    console.log('Status Code:', response.status);
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS: WhatsApp test message sent successfully!');
    } else {
      console.log('\n❌ ERROR: Meta API returned an error.');
    }
  } catch (err) {
    console.error('Failed to send test message:', err);
  }
}

// Get phone number from command line arg or default to admin phone
const testPhone = process.argv[2] || "9666913832";
sendTestMessage(testPhone)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
