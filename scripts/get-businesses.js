const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getBusinesses() {
  const config = await prisma.whatsappConfig.findFirst();
  const res = await fetch(`https://graph.facebook.com/v18.0/me/businesses`, {
    headers: { "Authorization": `Bearer ${config.accessToken}` }
  });
  const data = await res.json();
  console.log("Businesses:", data);

  if (data.data) {
    for (const b of data.data) {
      const wabaRes = await fetch(`https://graph.facebook.com/v18.0/${b.id}/owned_whatsapp_business_accounts`, {
        headers: { "Authorization": `Bearer ${config.accessToken}` }
      });
      console.log(`Owned WABAs for ${b.name}:`, await wabaRes.json());
      
      const clientWabaRes = await fetch(`https://graph.facebook.com/v18.0/${b.id}/client_whatsapp_business_accounts`, {
        headers: { "Authorization": `Bearer ${config.accessToken}` }
      });
      console.log(`Client WABAs for ${b.name}:`, await clientWabaRes.json());
    }
  }
}

getBusinesses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
