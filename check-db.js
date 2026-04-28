const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const mmfs = await p.provider.findMany({
    where: { type: 'MONEY_MARKET' },
    orderBy: { currentYield: 'desc' },
    take: 15,
    select: { name: true, slug: true, type: true, currentYield: true },
  });
  console.log('=== MONEY_MARKET providers ===');
  mmfs.forEach((m, i) => console.log(`${i+1}. ${m.name} (${m.slug}) — ${m.currentYield}% [${m.type}]`));

  const all = await p.provider.findMany({
    orderBy: { currentYield: 'desc' },
    select: { name: true, slug: true, type: true, currentYield: true },
  });
  console.log('\n=== ALL providers by type ===');
  const types = {};
  all.forEach(p => { types[p.type] = (types[p.type] || 0) + 1; });
  console.log(types);

  await p.$disconnect();
})();
