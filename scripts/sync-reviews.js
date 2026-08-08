const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up reviews...");
  await prisma.review.deleteMany({});
  
  console.log("Creating new seed reviews for Groundnut Oil...");
  await prisma.review.create({
    data: {
      productId: "groundnut-oil",
      name: "Thanvika Reddy",
      rating: 5,
      comment: "I have been looking for an honest wood pressed groundnut oil for cooking everyday meals. This is clean, doesn't smell chemically at all. Very pleased with the quality!",
      isVerified: true,
      mediaUrls: [],
      mediaTypes: [],
    }
  });

  await prisma.review.create({
    data: {
      productId: "groundnut-oil",
      name: "Ananya Sharma",
      rating: 5,
      comment: "Switching to Root & Harvest has been the best decision for our family's health. The sunflower oil is light, clean, and tastes incredibly pure in all our traditional dishes.",
      isVerified: true,
      mediaUrls: [],
      mediaTypes: [],
    }
  });

  console.log("Successfully seeded Groundnut Oil reviews database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
