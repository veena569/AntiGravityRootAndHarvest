const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXPENSES = [
  {
    date: "2026-07-07",
    category: "Bottles",
    item: "Glass Jars",
    quantity: "50",
    unitCost: 40,
    shippingCost: 300,
    amount: 2300,
    notes: ""
  },
  {
    date: "2026-08-25",
    category: "Seeds",
    item: "Oil Pressing",
    quantity: "50kg",
    unitCost: 125,
    shippingCost: 0,
    amount: 6250,
    notes: ""
  },
  {
    date: "2026-09-01",
    category: "Marketing",
    item: "Sai Suman",
    quantity: "1",
    unitCost: 10000,
    shippingCost: 0,
    amount: 10000,
    notes: ""
  },
  {
    date: "2026-08-31",
    category: "Seeds",
    item: "Rice",
    quantity: "25",
    unitCost: 70,
    shippingCost: 0,
    amount: 1750,
    notes: "Anna Sent"
  },
  {
    date: "2026-08-31",
    category: "Seeds",
    item: "Sesame seed",
    quantity: "40",
    unitCost: 130,
    shippingCost: 100,
    amount: 5300,
    notes: "Anna Sent"
  },
  {
    date: "2026-09-01",
    category: "Bottles",
    item: "5Liter tin",
    quantity: "8",
    unitCost: 80,
    shippingCost: 500,
    amount: 1140,
    notes: "national"
  },
  {
    date: "2026-09-01",
    category: "Bottles",
    item: "2Liter oilTin",
    quantity: "100",
    unitCost: 54,
    shippingCost: 500,
    amount: 5900,
    notes: "International"
  },
  {
    date: "2026-08-01",
    category: "Seeds",
    item: "Organic Groundnut",
    quantity: "50 kg",
    unitCost: 140,
    shippingCost: 500,
    amount: 7500,
    notes: "Surendhra"
  },
  {
    date: "2026-09-01",
    category: "Bottles",
    item: "1L Food Grade Oil Bottles",
    quantity: "100 pcs",
    unitCost: 45,
    shippingCost: 1000,
    amount: 5500,
    notes: "PET Bottles"
  },
  {
    date: "2026-08-10",
    category: "Cardboard Boxes",
    item: "Corrugated Shipping Boxes",
    quantity: "300 pcs",
    unitCost: 25,
    shippingCost: 500,
    amount: 8000,
    notes: "Heavy-duty 5-ply shipping boxes"
  },
  {
    date: "2026-08-12",
    category: "Label Printing",
    item: "Custom Waterproof Bottle Labels & Cap Seals",
    quantity: "2000 pcs",
    unitCost: 4,
    shippingCost: 300,
    amount: 8300,
    notes: "Metallic foil sticker printing batch"
  },
  {
    date: "2026-08-15",
    category: "Travelling",
    item: "Farm Visit & Seed Transport Freight",
    quantity: "1 Trip",
    unitCost: 4500,
    shippingCost: 0,
    amount: 4500,
    notes: "Transport from Rajkot mandi to pressing unit"
  },
  {
    date: "2026-08-18",
    category: "Covers & Packing",
    item: "Bubble Wrap & Outer Poly Covers",
    quantity: "2 Rolls",
    unitCost: 1100,
    shippingCost: 200,
    amount: 2400,
    notes: "Protective packaging for shipments"
  }
];

async function main() {
  console.log("Seeding BusinessExpenses into database...");
  for (const exp of EXPENSES) {
    const existing = await prisma.businessExpense.findFirst({
      where: {
        item: exp.item,
        date: exp.date
      }
    });

    if (existing) {
      await prisma.businessExpense.update({
        where: { id: existing.id },
        data: {
          category: exp.category,
          quantity: exp.quantity,
          unitCost: exp.unitCost,
          shippingCost: exp.shippingCost,
          amount: exp.amount,
          notes: exp.notes
        }
      });
      console.log(`Updated: ${exp.item}`);
    } else {
      await prisma.businessExpense.create({
        data: {
          date: exp.date,
          category: exp.category,
          item: exp.item,
          quantity: exp.quantity,
          unitCost: exp.unitCost,
          shippingCost: exp.shippingCost,
          amount: exp.amount,
          notes: exp.notes
        }
      });
      console.log(`Created: ${exp.item}`);
    }
  }

  const count = await prisma.businessExpense.count();
  console.log(`Total BusinessExpense records in DB: ${count}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
