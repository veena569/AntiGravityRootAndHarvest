const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePhoneId() {
  const newPhoneId = '1287131151144457';
  const token = 'EAAVT6zoqXSQBSdZCko7fPZCuuVla5skHGyyUrfNhHC3vb8CWfPuhhOXNvKp8paLBw8FFy4pqR1l30oqmb3ANZA9aYCTrxfatHbzhIjBJ0DnI9NxYRVzIXvVU6F1R5ShGBZBZAM4xNAuYCql8iInXz0OkAjLgqpQsYV8URXKDCOKB02LTrEMtMGDZAZCCZCIyIQZDZD';
  
  const updated = await prisma.whatsappConfig.upsert({
    where: { id: 'default' },
    update: { 
      phoneNumberId: newPhoneId,
      accessToken: token,
      businessNumber: '9121603832,9666913832',
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    },
    create: { 
      id: 'default', 
      phoneNumberId: newPhoneId,
      accessToken: token, 
      businessNumber: '9121603832,9666913832', 
      enableCustomerAlerts: true, 
      enableAdminAlerts: true 
    }
  });

  console.log('Database updated with production Phone Number ID:', JSON.stringify(updated, null, 2));
}

updatePhoneId().catch(console.error).finally(() => prisma.$disconnect());
