const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const token = 'EAAVT6zoqXSQBSdZCko7fPZCuuVla5skHGyyUrfNhHC3vb8CWfPuhhOXNvKp8paLBw8FFy4pqR1l30oqmb3ANZA9aYCTrxfatHbzhIjBJ0DnI9NxYRVzIXvVU6F1R5ShGBZBZAM4xNAuYCql8iInXz0OkAjLgqpQsYV8URXKDCOKB02LTrEMtMGDZAZCCZCIyIQZDZD';
  
  const updated = await prisma.whatsappConfig.upsert({
    where: { id: 'default' },
    update: { 
      accessToken: token, 
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    },
    create: { 
      id: 'default', 
      accessToken: token, 
      businessNumber: '9666913832,9121603832', 
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    }
  });

  console.log('Database updated successfully:', JSON.stringify(updated, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
