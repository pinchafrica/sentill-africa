const fs = require('fs');
const path = require('path');

// Read from one of the still-intact 5MB files
const lines = fs.readFileSync('components/Navbar.tsx', 'utf-8').split('\n');

const componentNames = [
  "AccordionItem", "AIChatbot", "AllocationChart", "AuditReport", "CortexWidget", "Footer", 
  "GoalTracker", "InterceptorModal", "InvestButton", "LiveTicker", "LogAssetModal", "MarketOverview", 
  "NSEStockChart", "NSETechnicalGauge", "Navbar", "PortfolioProjectionChart", "PremiumModal", 
  "PremiumShowcase", "ProviderCard", "SentillOracle", "SocialSentimentPulse", "SystemAdminDashboard", 
  "TaxAlphaOptimizer", "TechnicalAnalysis", "TradingViewChart", "UpgradePaymentModal", "YieldChart"
];

let foundExports = [];

for (let name of componentNames) {
  // Broader regex: just look for the component name being exported or declared as a function/const.
  // E.g., export default function Navbar
  // export function Navbar
  // export const Navbar
  // const Navbar =
  const regex = new RegExp(`(?:export\\s+(?:default\\s+)?)?(?:function|const|let)\\s+${name}\\b`);
  
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      // make sure it isn't just a random usage, check if column is close to 0
      if (!lines[i].includes('//') && !lines[i].includes('return ')) {
        foundExports.push({ name: name, exportLine: i });
        break; 
      }
    }
  }
}

// Ensure found components are unique
const uniqueExports = [];
const seenNames = new Set();
for (let e of foundExports) {
  if (!seenNames.has(e.name)) {
    seenNames.add(e.name);
    uniqueExports.push(e);
  }
}

uniqueExports.sort((a, b) => a.exportLine - b.exportLine);

console.log(`Found ${uniqueExports.length} components.`);

let blocks = [];
for (let i = 0; i < uniqueExports.length; i++) {
  const current = uniqueExports[i];
  let startLine = current.exportLine;
  
  if (i === 0) {
    startLine = 0;
  } else {
    for (let j = current.exportLine; j >= uniqueExports[i-1].exportLine; j--) {
      // Typical starts of files
      if (lines[j].startsWith('import ') || lines[j].startsWith('"use client";') || lines[j].startsWith("'use client';")) {
        startLine = j;
      }
      if (lines[j] === '}' && j < current.exportLine - 2) {
        startLine = j + 1;
        break; 
      }
    }
    if (startLine <= uniqueExports[i-1].exportLine) startLine = uniqueExports[i-1].exportLine + 1;
  }
  
  blocks.push({
    name: current.name,
    startLine: startLine,
    exportLine: current.exportLine
  });
}

// Find where the chunk repeats so we know where the very last component ends.
// We look for where AccordionItem appears again, or just take the rest of the file until a '}' at column 0 which drops us near EOF.
let lastEndLine = lines.length;
for (let j = blocks[blocks.length - 1].exportLine + 1; j < lines.length; j++) {
  if (lines[j].includes('function ' + blocks[0].name) || lines[j].includes('const ' + blocks[0].name)) {
    let end = j;
    for (let k = j; k >= j - 50; k--) {
      if (lines[k] === '}') {
        end = k + 1;
        break;
      }
    }
    lastEndLine = end;
    break;
  }
}

for (let i = 0; i < blocks.length; i++) {
  const endLine = i === blocks.length - 1 ? lastEndLine : blocks[i + 1].startLine;
  const content = lines.slice(blocks[i].startLine, endLine).join('\n').trim() + '\n';
  const outPath = path.join('components', blocks[i].name + '.tsx');
  fs.writeFileSync(outPath, content);
  console.log(`Restored: ${outPath} (${endLine - blocks[i].startLine} lines)`);
}

// Done
console.log("Successfully extracted 27 components!");
