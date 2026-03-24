const fs = require('fs');

function fixDuplicatedFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // It's likely duplicated starting with "use client" or "import"
  // Let's find the first 100 characters to use as a signature
  const signature = content.substring(0, 100);
  
  // Find the SECOND occurrence of the signature
  const secondIndex = content.indexOf(signature, 10);
  
  if (secondIndex !== -1) {
    const originalContent = content.substring(0, secondIndex);
    fs.writeFileSync(filepath, originalContent);
    console.log(`Fixed ${filepath}: truncated to ${originalContent.length} chars (was ${content.length})`);
  } else {
    console.log(`${filepath} was not duplicated.`);
  }
}

fixDuplicatedFile('app/packages/page.tsx');
fixDuplicatedFile('components/TechnicalAnalysis.tsx');
fixDuplicatedFile('components/TradingViewChart.tsx');
