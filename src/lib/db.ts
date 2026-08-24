import { PrismaClient } from "@prisma/client";

const defaultDbUrl =
  "postgresql://postgres:3ce798c2c5fb8060a2eb52a89b3e3e03@z77efabp.us-east.database.insforge.app:5432/insforge?sslmode=require";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDbUrl;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || defaultDbUrl,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
