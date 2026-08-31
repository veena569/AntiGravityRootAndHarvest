const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugToken() {
  const config = await prisma.whatsappConfig.findFirst();
  
  // Debug token
  const res = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name`, {
    headers: { Authorization: `Bearer ${config.accessToken}` }
  });
  console.log('Token Identity:', await res.json());

  // Try fetching phone number details with WABA ID
  const resPhone = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
    headers: { Authorization: `Bearer ${config.accessToken}` }
  });
  console.log('Current Phone details:', await resPhone.json());
}

debugToken().catch(console.error).finally(() => prisma.$disconnect());
