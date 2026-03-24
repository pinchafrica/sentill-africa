$ErrorActionPreference = "Stop"
npm install prisma@5.15.1 @prisma/client@5.15.1
npx prisma db push
npx prisma generate
npm run build
