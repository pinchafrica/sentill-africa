import fs from 'fs';
import path from 'path';

const routes = [
  'app/academy',
  'app/markets/treasuries',
  'app/markets/corporate-bonds',
  'app/markets/reits',
  'app/markets/us-stocks',
  'app/markets/global-etfs',
  'app/markets/commodities',
  'app/markets/pe',
  'app/markets/vc',
  'app/markets/agri'
];

routes.forEach(route => {
  const dirPath = path.join(process.cwd(), route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const title = route.split('/').pop().replace(/-/g, ' ').toUpperCase();
  const fileContent = `
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Page() {
  return <PlaceholderPage title="${title} Market" />;
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), fileContent);
  console.log('Created', route);
});
