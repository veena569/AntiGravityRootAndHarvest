import { PrismaClient } from "@prisma/client";

const defaultDbUrl =
  "postgresql://postgres:3ce798c2c5fb8060a2eb52a89b3e3e03@z77efabp.us-east.database.insforge.app:5432/insforge?sslmode=require";

function getFormattedDbUrl() {
  let url = process.env.DATABASE_URL || defaultDbUrl;
  if (!url.includes("connection_limit=")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}connection_limit=5&pool_timeout=20`;
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: getFormattedDbUrl(),
    log: ["error", "warn"],
  });

globalForPrisma.prisma = prisma;

