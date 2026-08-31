const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConfig() {
  const config = await prisma.whatsappConfig.findFirst();
  console.log('Current Database Configuration:');
  console.log('- Phone Number ID:', config?.phoneNumberId);
  console.log('- Enable Customer Alerts:', config?.enableCustomerAlerts);
  console.log('- Enable Admin Alerts:', config?.enableAdminAlerts);
  console.log('- Access Token (masked):', config?.accessToken ? (config.accessToken.substring(0, 15) + '...') : 'Missing');
}

testConfig()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
