const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBestWebProvider() {
  const providers = await prisma.provider.findMany({
    where: {
      name: {
        contains: 'bestweb',
        mode: 'insensitive'
      }
    }
  });

  if (providers.length > 0) {
    console.log(JSON.stringify(providers, null, 2));
  } else {
    console.log('No providers with "bestweb" found.');
  }
  await prisma.$disconnect();
}

findBestWebProvider();
