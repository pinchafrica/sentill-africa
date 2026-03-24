$ErrorActionPreference = "Stop"
npx -y create-next-app@latest sentill-app --typescript --tailwind --app --eslint --src-dir false --import-alias "@/*" --use-npm --yes
Get-ChildItem -Path .\sentill-app -Force | Move-Item -Destination .\ -Force
Remove-Item -Path .\sentill-app -Recurse -Force
npm install prisma @prisma/client chart.js react-chartjs-2 lucide-react
npx prisma init --datasource-provider sqlite
