const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWabaNumbers() {
  try {
    const config = await prisma.whatsappConfig.findFirst();
    if (!config || !config.accessToken) {
      console.error('Missing access token');
      return;
    }

    // First fetch WABA ID linked to the current phone number or user
    const urlPhone = `https://graph.facebook.com/v18.0/${config.phoneNumberId}?fields=whatsapp_business_account`;
    const resPhone = await fetch(urlPhone, { headers: { Authorization: `Bearer ${config.accessToken}` } });
    const dataPhone = await resPhone.json();

    console.log('Phone WABA Link:', dataPhone);

    if (dataPhone?.whatsapp_business_account?.id) {
      const wabaId = dataPhone.whatsapp_business_account.id;
      console.log(`\nFetching all registered phone numbers for WABA ID: ${wabaId}...`);
      
      const urlWaba = `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?fields=display_phone_number,verified_name,code_verification_status,quality_rating`;
      const resWaba = await fetch(urlWaba, { headers: { Authorization: `Bearer ${config.accessToken}` } });
      const dataWaba = await resWaba.json();

      console.log('\n--- REGISTERED PHONE NUMBERS ---');
      console.log(JSON.stringify(dataWaba, null, 2));
    }
  } catch (err) {
    console.error('Error fetching WABA numbers:', err);
  }
}

checkWabaNumbers().catch(console.error).finally(() => prisma.$disconnect());
