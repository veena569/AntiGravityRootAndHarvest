const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProdToken() {
  const prodToken = 'EAAVT6zoqXSQBSRFgSYg3uWuFpvnEaZBNMeBxNOCvKOaQFQdfwZAON6UZBwYVgD5OYxbpByCZBgSWA6WKf1SVW94rSdaF7PEiMpgeN8P4VSso45efne6Mddg1AVXl3p5Q9JeAZAsuij8ISZAhfTi6EqpFQ4yBZCQv8k1lXrBNiQWZBGRVfFQfZATxTeYfdk4jJzQZDZD';
  const phoneId = '1287131151144457';

  const updated = await prisma.whatsappConfig.upsert({
    where: { id: 'default' },
    update: { 
      accessToken: prodToken,
      phoneNumberId: phoneId,
      businessNumber: '9121603832,9666913832',
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    },
    create: { 
      id: 'default', 
      accessToken: prodToken,
      phoneNumberId: phoneId, 
      businessNumber: '9121603832,9666913832', 
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    }
  });

  console.log('Production token updated in DB successfully:', JSON.stringify(updated, null, 2));
}

updateProdToken().catch(console.error).finally(() => prisma.$disconnect());
