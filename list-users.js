const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true
    }
  });

  const content = users.map(u => `${u.name} (${u.email})`).join('\n');
  fs.writeFileSync('users_clean.txt', content);
  console.log('Users written to users_clean.txt');
  await prisma.$disconnect();
}

listUsers();
