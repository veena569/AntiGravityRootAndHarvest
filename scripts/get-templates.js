const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWabaTemplates() {
  const config = await prisma.whatsappConfig.findFirst();
  
  // First, get WABA ID from phone number ID
  const phoneRes = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
    headers: { "Authorization": `Bearer ${config.accessToken}` }
  });
  const phoneData = await phoneRes.json();
  console.log("Phone Number Info:", phoneData);

  // Now get templates
  // Get WABA ID or debug token
  const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${config.accessToken}&access_token=${config.accessToken}`);
  const debugData = await debugRes.json();
  console.log("Token Debug Info:", debugData);

  // Let's list message templates if we have WABA ID
  // Let's fetch business accounts
  const meRes = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,accounts`, {
    headers: { "Authorization": `Bearer ${config.accessToken}` }
  });
  console.log("Me Info:", await meRes.json());
}

getWabaTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
