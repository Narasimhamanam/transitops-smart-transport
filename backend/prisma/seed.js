const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Transit@123';

const seedUsers = [
  {
    name: 'Alex Morgan',
    email: 'fleet@transitops.com',
    role: 'FLEET_MANAGER',
  },
  {
    name: 'Jordan Lee',
    email: 'dispatcher@transitops.com',
    role: 'DISPATCHER',
  },
  {
    name: 'Casey Rivera',
    email: 'safety@transitops.com',
    role: 'SAFETY_OFFICER',
  },
  {
    name: 'Taylor Kim',
    email: 'finance@transitops.com',
    role: 'FINANCIAL_ANALYST',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const userData of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log(`✅ Seeded user: ${user.name} (${user.role}) — ${user.email}`);
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
