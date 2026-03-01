require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Updating avatar paths from PNG to SVG...');
  
  // Get all users first
  const users = await prisma.user.findMany({
    select: { id: true, image: true }
  });
  
  console.log(`Found ${users.length} user(s)`);
  
  // Update each user
  let updated = 0;
  for (const user of users) {
    if (user.image === '/images/default-avatar.png') {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: '/images/default-avatar.svg' }
      });
      updated++;
    }
  }

  console.log(`✅ Updated ${updated} user(s)`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
