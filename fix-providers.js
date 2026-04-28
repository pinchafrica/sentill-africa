const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  // Update remaining MMF rates to April 2026 actuals
  const updates = [
    { slug: 'icea',        yield: 11.80, name: 'ICEA Lion Money Market Fund' },
    { slug: 'oldmutual',   yield: 10.20, name: 'Old Mutual Money Market Fund' },
    { slug: 'equity-mmf',  yield: 10.58, name: 'Equity Money Market Fund' },
  ];
  for (const u of updates) {
    const r = await p.provider.updateMany({ where: { slug: u.slug }, data: { currentYield: u.yield, name: u.name } });
    if (r.count > 0) console.log(`✅ ${u.name}: ${u.yield}%`);
  }

  console.log('\n=== FINAL MMF TABLE ===');
  const mmfs = await p.provider.findMany({ where: { type: 'MONEY_MARKET' }, orderBy: { currentYield: 'desc' }, select: { name: true, currentYield: true } });
  mmfs.forEach((m, i) => console.log(`${i+1}. ${m.name} — ${m.currentYield}%`));
  await p.$disconnect();
})();
