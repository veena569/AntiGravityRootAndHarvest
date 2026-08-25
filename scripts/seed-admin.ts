import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@rootandharvest.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const adminName = "System Administrator";

  console.log(`Seeding admin account for: ${adminEmail}...`);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      name: adminName,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      name: adminName,
    },
  });

  console.log(`✅ Admin account created/updated successfully!`);
  console.log(`   User ID: ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("Error seeding admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
