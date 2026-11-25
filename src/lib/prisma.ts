import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: runtimeDatabaseUrl(process.env.DATABASE_URL) });

globalForPrisma.prisma = prisma;
