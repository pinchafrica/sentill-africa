const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findKenyaUsers() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'kenya',
        mode: 'insensitive'
      }
    }
  });

  if (users.length > 0) {
    console.log(JSON.stringify(users, null, 2));
  } else {
    console.log('No users with "kenya" in email found.');
  }
  await prisma.$disconnect();
}

findKenyaUsers();
