const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPhone() {
  const config = await prisma.whatsappConfig.findFirst();
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,code_verification_status`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${config.accessToken}` } });
  const data = await res.json();
  console.log('Phone details from Meta:', data);
}

checkPhone().catch(console.error).finally(() => prisma.$disconnect());
