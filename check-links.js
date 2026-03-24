
const fs = require('fs');
const content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const links = [...content.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
const uniqueLinks = [...new Set(links)].filter(l => l.startsWith('/'));

async function checkLinks() {
  console.log('Checking ' + uniqueLinks.length + ' links...');
  let errors = [];
  for (const link of uniqueLinks) {
    try {
      const res = await fetch('http://localhost:3000' + link);
      if (res.status === 404 || res.status >= 500) {
        errors.push(res.status + ' ERROR on: ' + link);
      }
    } catch(e) {
      errors.push('FETCH FAILED on: ' + link);
    }
  }
  if (errors.length === 0) console.log('? All links are valid!');
  else console.log(errors.join('\n'));
}
checkLinks();

