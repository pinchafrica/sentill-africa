const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'bestweb', mode: 'insensitive' } },
          { name: { contains: 'bestweb', mode: 'insensitive' } }
        ]
      }
    });
    console.log('Users found:', users.length);
    if (users.length > 0) console.log(JSON.stringify(users, null, 2));

    const payments = await prisma.payment.findMany({
       where: {
         OR: [
           { reference: { contains: 'bestweb', mode: 'insensitive' } },
           { paystackRef: { contains: 'bestweb', mode: 'insensitive' } },
           { mpesaRef: { contains: 'bestweb', mode: 'insensitive' } }
         ]
       }
    });
    console.log('Payments found:', payments.length);
    if (payments.length > 0) console.log(JSON.stringify(payments, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
