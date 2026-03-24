const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'bestwebkenya@gmail.com'
    }
  });

  if (user) {
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log('User not found: bestwebkenya@gmail.com');
  }
  await prisma.$disconnect();
}

checkUser();
