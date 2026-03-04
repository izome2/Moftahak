import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

if (!globalForPrisma.prisma) {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  const adapter = new PrismaPg(globalForPrisma.pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
export default prisma;
