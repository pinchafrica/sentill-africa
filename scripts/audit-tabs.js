const fs = require('fs');
const path = require('path');

const TAB_FILES = [
  'app/academy/page.tsx',
  'app/admin/analytics/page.tsx',
  'app/dashboard/allocation/page.tsx',
  'app/dashboard/chamas/page.tsx',
  'app/dashboard/settings/page.tsx',
  'app/diaspora/page.tsx',
  'app/markets/bonds/page.tsx',
  'app/markets/eurobonds/page.tsx',
  'app/markets/mmfs/[id]/page.tsx',
  'app/markets/nse/page.tsx',
  'app/markets/nse/[symbol]/page.tsx',
  'app/markets/special/[id]/page.tsx',
  'app/markets/treasuries/page.tsx',
];

const base = path.resolve(__dirname, '..');
const results = [];

TAB_FILES.forEach(rel => {
  const fp = path.join(base, rel);
  try {
    const code = fs.readFileSync(fp, 'utf8');

    // Extract tab button onClick values
    const onClickMatches = [...code.matchAll(/setActiveTab\s*\(\s*["']([^"']+)["']\s*\)/g)];
    const tabValues = [...new Set(onClickMatches.map(m => m[1]))];

    // Extract tab content conditionals  
    const condMatches = [...code.matchAll(/activeTab\s*===\s*["']([^"']+)["']/g)];
    const condValues = [...new Set(condMatches.map(m => m[1]))];

    // Find mismatches
    const missingContent = tabValues.filter(v => !condValues.includes(v));
    const orphanContent = condValues.filter(v => !tabValues.includes(v));

    // Check initial state
    const initMatch = code.match(/useState<[^>]*>\s*\(\s*["']([^"']+)["']\s*\)/);
    const initVal = initMatch ? initMatch[1] : 'unknown';

    // Check if initial value is in tabs
    const badInit = tabValues.length > 0 && !tabValues.includes(initVal) && !condValues.includes(initVal);

    const hasIssue = missingContent.length > 0 || orphanContent.length > 0 || badInit;

    results.push({ file: rel, tabValues, condValues, missingContent, orphanContent, initVal, badInit, hasIssue });
  } catch (e) {
    results.push({ file: rel, error: e.message, hasIssue: true });
  }
});

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║              SENTIL TAB SYSTEM AUDIT REPORT                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

results.forEach(r => {
  if (r.error) {
    console.log(`❌ ERROR  ${r.file}`);
    console.log(`   ${r.error}`);
    return;
  }
  const icon = r.hasIssue ? '❌ FAIL ' : '✅ PASS ';
  console.log(`${icon} ${r.file}`);
  console.log(`   Tabs (${r.tabValues.length}): [${r.tabValues.join(', ')}]`);
  console.log(`   Content (${r.condValues.length}): [${r.condValues.join(', ')}]`);
  console.log(`   Initial state: "${r.initVal}"`);
  if (r.missingContent.length) console.log(`   ⚠️  TABS WITH NO CONTENT: ${r.missingContent.join(', ')}`);
  if (r.orphanContent.length) console.log(`   ⚠️  CONTENT WITH NO TAB: ${r.orphanContent.join(', ')}`);
  if (r.badInit) console.log(`   ⚠️  BAD INIT VALUE: "${r.initVal}" not in tab list`);
  console.log('');
});

const fails = results.filter(r => r.hasIssue);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`TOTAL: ${results.length} files | PASS: ${results.length - fails.length} | FAIL: ${fails.length}`);
if (fails.length === 0) console.log('✅ ALL TABS HEALTHY');
else {
  console.log('\nFailed files:');
  fails.forEach(f => console.log(' •', f.file));
}
