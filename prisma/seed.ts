import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const providers = [
  {
    name: "Etica Capital (Daily Interest)",
    slug: "etica-capital",
    type: "MMF",
    currentYield: 17.55,
    aum: "KES 15B+",
    paybill: "511116",
    isHalal: false,
    riskLevel: "Low",
    description: "Etica Wealth Fund is a regulated Money Market Fund by CMA Kenya, offering daily interest computation and high liquidity.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 15 + Math.random() * 3))
  },
  {
    name: "Sanlam Investments",
    slug: "sanlam-investments",
    type: "MMF",
    currentYield: 14.20,
    aum: "KES 50B+",
    paybill: "880100",
    isHalal: false,
    riskLevel: "Low",
    description: "Sanlam is a leading pan-African financial services group, providing secure and regulated investment solutions.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 12 + Math.random() * 2))
  },
  {
    name: "Stima SACCO",
    slug: "stima-sacco",
    type: "SACCO",
    currentYield: 15.0,
    aum: "KES 60B+",
    paybill: "823100",
    isHalal: false,
    riskLevel: "Moderate",
    description: "Tier-1 Kenyan SACCO known for consistent 15% dividend yields and excellent member benefits.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 13 + Math.random() * 2))
  },
  {
    name: "Safaricom PLC (SCOM)",
    slug: "safaricom-plc",
    type: "Equity",
    currentYield: 11.2,
    aum: "KES 580B",
    paybill: "N/A",
    isHalal: true,
    riskLevel: "High",
    description: "The largest telecommunications provider in East Africa, offering consistent dividends and market leadership.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 10 + Math.random() * 4))
  },
  {
    name: "IFB1/2024/8.5Y Infrastructure Bond",
    slug: "ifb-bond-2024",
    type: "Bond",
    currentYield: 18.46,
    aum: "KES 70B",
    paybill: "N/A",
    isHalal: false,
    riskLevel: "Low",
    description: "Government-backed infrastructure bond offering high yields completely immune to KRA withholding tax.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 16 + Math.random() * 3))
  },
  {
    name: "First Community MMF (Shariah)",
    slug: "first-community-shariah",
    type: "MMF",
    currentYield: 11.5,
    aum: "KES 5B",
    paybill: "754388",
    isHalal: true,
    riskLevel: "Low",
    description: "Kenya's premier Shariah-compliant money market fund for ethical wealth growth.",
    history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 9 + Math.random() * 2))
  }
];

async function main() {
  console.log("Seeding database...");
  for (const p of providers) {
    await prisma.provider.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  await prisma.user.upsert({
    where: { email: "demo@sentill.africa" },
    update: {},
    create: {
      id: "demo-user",
      name: "Sentill Demo User",
      email: "demo@sentill.africa",
      isPremium: false,
    },
  });
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
