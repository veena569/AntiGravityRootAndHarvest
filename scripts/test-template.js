const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendTemplateTest(recipientPhone) {
  try {
    const config = await prisma.whatsappConfig.findFirst();
    let formattedPhone = recipientPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    console.log(`Sending 'hello_world' Meta Template to +${formattedPhone}...`);

    const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US"
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('\n--- META TEMPLATE API RESPONSE ---');
    console.log('Status Code:', response.status);
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS: Template message sent successfully!');
    } else {
      console.log('\n❌ ERROR: Meta API returned error.');
    }
  } catch (err) {
    console.error('Failed to send template message:', err);
  }
}

async function main() {
  await sendTemplateTest("8008076707");
  await sendTemplateTest("9666913832");
  await prisma.$disconnect();
}

main();
