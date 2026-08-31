const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWabaIdAndTemplates() {
  const config = await prisma.whatsappConfig.findFirst();
  
  // Get WABA ID from phone number ID with fields=whatsapp_business_account
  const phoneRes = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}?fields=whatsapp_business_account`, {
    headers: { "Authorization": `Bearer ${config.accessToken}` }
  });
  const phoneData = await phoneRes.json();
  console.log("WABA Info:", phoneData);

  const wabaId = phoneData?.whatsapp_business_account?.id;
  if (wabaId) {
    const tplRes = await fetch(`https://graph.facebook.com/v18.0/${wabaId}/message_templates`, {
      headers: { "Authorization": `Bearer ${config.accessToken}` }
    });
    const tplData = await tplRes.json();
    console.log("Approved Templates:", JSON.stringify(tplData, null, 2));
  }
}

getWabaIdAndTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
