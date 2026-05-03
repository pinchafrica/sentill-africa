import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const msgs = await p.whatsAppLog.findMany({
  where: { waId: '254726260884', msgType: { not: 'webhook_debug' } },
  orderBy: { createdAt: 'desc' },
  take: 30,
  select: { direction: true, message: true, createdAt: true }
});

msgs.reverse().forEach(m => {
  const dir = m.direction === 'INBOUND' ? '👤 USER' : '🤖 BOT ';
  const time = new Date(m.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  console.log(`${dir} [${time}] ${m.message.slice(0, 250)}`);
  console.log('');
});

// Compute AI score
const inbound = msgs.filter(m => m.direction === 'INBOUND');
const outbound = msgs.filter(m => m.direction === 'OUTBOUND');

const coverageRatio = inbound.length > 0 ? Math.min(outbound.length / inbound.length, 1) : 0;
const coverageScore = Math.round(coverageRatio * 20);

let totalResp = 0, respCount = 0;
for (let i = 1; i < msgs.length; i++) {
  if (msgs[i].direction === 'OUTBOUND' && msgs[i-1].direction === 'INBOUND') {
    const diff = new Date(msgs[i].createdAt).getTime() - new Date(msgs[i-1].createdAt).getTime();
    if (diff > 0 && diff < 300000) { totalResp += diff; respCount++; }
  }
}
const avgMs = respCount > 0 ? totalResp / respCount : null;
let speedScore = 10;
if (avgMs !== null) {
  if (avgMs < 2000) speedScore = 20;
  else if (avgMs < 5000) speedScore = 16;
  else if (avgMs < 10000) speedScore = 12;
  else if (avgMs < 30000) speedScore = 8;
  else speedScore = 4;
}

const dataSignals = ["kes", "%", "yield", "rate", "return", "ksh", "invest", "portfolio", "mmf", "t-bill", "bond", "sacco", "nse", "dividend", "safaricom", "equity", "kcb", "compare", "chart", "analysis"];
let dataHits = 0;
outbound.forEach(m => {
  dataSignals.forEach(sig => { if (m.message.toLowerCase().includes(sig)) dataHits++; });
});
const depthRatio = outbound.length > 0 ? Math.min(dataHits / (outbound.length * 3), 1) : 0;
const depthScore = Math.round(depthRatio * 25);

let engagementScore = 4;
if (msgs.length >= 20) engagementScore = 20;
else if (msgs.length >= 12) engagementScore = 16;
else if (msgs.length >= 6) engagementScore = 12;
else if (msgs.length >= 3) engagementScore = 8;

const topicKws = ["portfolio","subscribe","markets","menu","goals","watchlist","status","renew","help","hi","hello","invest","mmf","t-bill","bond","sacco","yield","rate","price","nse","stock"];
const topicsCovered = topicKws.filter(kw => inbound.some(m => m.message.toLowerCase().includes(kw))).length;
let diversityScore = 3;
if (topicsCovered >= 6) diversityScore = 15;
else if (topicsCovered >= 4) diversityScore = 12;
else if (topicsCovered >= 2) diversityScore = 8;

const total = Math.min(100, coverageScore + speedScore + depthScore + engagementScore + diversityScore);
const grade = total >= 85 ? "A+" : total >= 70 ? "A" : total >= 55 ? "B" : total >= 40 ? "C" : "D";

console.log('\n═══════════════════════════════════════');
console.log(`🧠 AI INTELLIGENCE SCORE: ${total}/100 (${grade})`);
console.log('═══════════════════════════════════════');
console.log(`📡 Coverage:   ${coverageScore}/20  (${inbound.length} in → ${outbound.length} out)`);
console.log(`⚡ Speed:      ${speedScore}/20  (avg ${avgMs ? (avgMs/1000).toFixed(1) + 's' : 'N/A'})`);
console.log(`📊 Depth:      ${depthScore}/25  (${dataHits} data signals found)`);
console.log(`💬 Engagement: ${engagementScore}/20  (${msgs.length} total messages)`);
console.log(`🎯 Diversity:  ${diversityScore}/15  (${topicsCovered} unique topics)`);
console.log('═══════════════════════════════════════');

await p.$disconnect();
