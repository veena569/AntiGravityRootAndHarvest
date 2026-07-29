const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("Last 5 orders:");
  orders.forEach(o => {
    console.log(`Order: ${o.orderNumber}, Email: ${o.shippingEmail}, Status: ${o.paymentStatus}, Total: ${o.total}, Created: ${o.createdAt}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
