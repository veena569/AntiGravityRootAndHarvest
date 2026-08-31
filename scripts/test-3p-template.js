const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test3pTemplate(recipientPhone) {
  try {
    const config = await prisma.whatsappConfig.findFirst();
    let formattedPhone = recipientPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    console.log(`Sending Meta Integration Test Template to +${formattedPhone}...`);
    console.log(`Using Phone ID: ${config.phoneNumberId}`);

    const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "3p_direct_integration_test_template",
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
    console.log('\n--- META TEMPLATE RESPONSE ---');
    console.log('Status Code:', response.status);
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS: 3p_direct_integration_test_template sent successfully!');
    } else {
      console.log('\n❌ ERROR: Meta API returned error.');
    }
  } catch (err) {
    console.error('Failed to send 3p template:', err);
  }
}

const target = process.argv[2] || "9666913832";
test3pTemplate(target)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
