const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const missing = [
    { slug: 'cytonn-mmf', name: 'Cytonn Money Market Fund', type: 'MONEY_MARKET', currentYield: 12.00, minimumInvest: 'KES 1,000', aum: 'KES 5B+', riskLevel: 'Low', description: 'Cytonn Investments managed MMF with competitive returns' },
    { slug: 'kcb-mmf',    name: 'KCB Money Market Fund',    type: 'MONEY_MARKET', currentYield: 15.40, minimumInvest: 'KES 1,000', aum: 'KES 20B+', riskLevel: 'Low', description: 'KCB Group managed money market fund' },
    { slug: 'britam-mmf', name: 'Britam Money Market Fund', type: 'MONEY_MARKET', currentYield: 13.00, minimumInvest: 'KES 1,000', aum: 'KES 15B+', riskLevel: 'Low', description: 'Britam Asset Managers money market fund' },
  ];
  for (const m of missing) {
    const exists = await p.provider.findFirst({ where: { slug: m.slug } });
    if (!exists) {
      await p.provider.create({ data: m });
      console.log(`🆕 Created: ${m.name}: ${m.currentYield}%`);
    } else {
      await p.provider.update({ where: { id: exists.id }, data: { currentYield: m.currentYield, name: m.name } });
      console.log(`✅ Updated: ${m.name}: ${m.currentYield}%`);
    }
  }
  console.log('\n=== FINAL VERIFIED TABLE ===');
  const mmfs = await p.provider.findMany({ where: { type: 'MONEY_MARKET' }, orderBy: { currentYield: 'desc' }, select: { name: true, currentYield: true } });
  mmfs.forEach((m, i) => console.log(`${i+1}. ${m.name} — ${m.currentYield}%`));
  await p.$disconnect();
})();
