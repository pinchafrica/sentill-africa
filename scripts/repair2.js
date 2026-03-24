const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync('components/Navbar.tsx', 'utf-8').split('\n');

const componentNames = [
  { name: "MarketOverview", trigger: "MarketOverviewWidget" },
  { name: "TechnicalAnalysis", trigger: "TechnicalAnalysis" }, // Just guessing it might be TechnicalAnalysisWidget or TechnicalAnalysis
  { name: "TradingViewChart", trigger: "TradingViewChart" }
];

let foundExports = [];

for (let comp of componentNames) {
  for (let i = 0; i < lines.length; i++) {
    // looking for the export default line or the const line
    if (lines[i].includes(`export default memo(${comp.trigger})`) || 
        lines[i].includes(`export default ${comp.trigger}`) || 
        lines[i].includes(`const ${comp.name} =`) ||
        lines[i].includes(`function ${comp.name}(`) ||
        lines[i].includes(`const ${comp.trigger}`)) {
          
        if (!lines[i].includes('//') && (lines[i].startsWith('export ') || lines[i].startsWith('const ') || lines[i].startsWith('function '))) {
           foundExports.push({ name: comp.name, exportLine: i });
           break;
        }
    }
  }
}

// deduplicate
let unique = [];
let seen = new Set();
for (let e of foundExports) {
  if (!seen.has(e.name)) {
    unique.push(e);
    seen.add(e.name);
  }
}

unique.sort((a,b) => a.exportLine - b.exportLine);
console.log(`Found ${unique.length} special components.`);

for (let current of unique) {
  // walk backward
  let startLine = current.exportLine;
  for (let j = current.exportLine; j >= 0; j--) {
      if (lines[j].startsWith('import ') || lines[j].startsWith('"use client";') || lines[j].startsWith("'use client';")) {
        startLine = j;
      }
      if (lines[j] === '}' && j < current.exportLine - 2) {
        startLine = j + 1;
        break; 
      }
  }
  
  // walk forward
  let endLine = current.exportLine;
  for (let j = current.exportLine; j < lines.length; j++) {
     if (lines[j] === '}') {
        endLine = j + 1;
        // Check if next lines are new component
        let isEnd = false;
        for (let k = j + 1; k < j + 10 && k < lines.length; k++) {
           if (lines[k].startsWith('import ') || lines[k].startsWith('"use client";') || lines[k].startsWith('export ')) {
             isEnd = true;
             break;
           }
        }
        if (isEnd) break;
     }
  }
  
  const content = lines.slice(startLine, endLine).join('\n').trim() + '\n';
  const outPath = path.join('components', current.name + '.tsx');
  fs.writeFileSync(outPath, content);
  console.log(`Restored: ${outPath} (${endLine - startLine} lines)`);
}
