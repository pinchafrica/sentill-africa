import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 [Seed Engine] Initializing Institutional Data...");

    // ... (providers array remains same, but I'll skip to the user section for conciseness or just replace the whole main logic)
    const providers = [
        // (Keeping existing providers)
        { name: "Etica MMF", slug: "etica-mmf", type: "MMF", currentYield: 14.81, aum: "KES 5.2B", paybill: "123456", isHalal: false, riskLevel: "Low", managementFee: 2.0, inceptionDate: "Jan 2018", description: "A high-yielding Money Market Fund by Etica Wealth.", email: "info@eticawealth.com", phone: "+254 700 000 000", website: "https://eticawealth.com", history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 15 + Math.random() * 3)) },
        { name: "Sanlam MMF", slug: "sanlam-mmf", type: "MMF", currentYield: 13.65, aum: "KES 15.4B", paybill: "246810", isHalal: false, riskLevel: "Low", managementFee: 2.0, inceptionDate: "Mar 2010", description: "Stable and secure MMF by Sanlam Investments.", email: "customerservice@sanlam.co.ke", phone: "+254 20 2781000", website: "https://sanlam.co.ke", history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 12 + Math.random() * 2)) },
        { name: "Stima SACCO", slug: "stima-sacco", type: "SACCO", currentYield: 14.0, aum: "KES 52.1B", paybill: "823456", isHalal: false, riskLevel: "Moderate", managementFee: 0.0, inceptionDate: "May 1974", description: "Tier-1 SACCO specializing in member-based lending.", email: "stimasacco@stima-sacco.com", phone: "+254 703 024 000", website: "https://stima-sacco.com", history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 13 + Math.random() * 2)) },
        { name: "Genghis Iman", slug: "genghis-iman-halal", type: "MMF", currentYield: 11.5, aum: "KES 2.1B", paybill: "333444", isHalal: true, riskLevel: "Low", managementFee: 2.5, inceptionDate: "Sep 2015", description: "Strictly Shariah-compliant unit trust fund.", email: "info@genghis-capital.com", phone: "+254 709 185 000", website: "https://genghis-capital.com", history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 10 + Math.random() * 2)) },
        { name: "Old Mutual Pension", slug: "old-mutual-pension", type: "Pension", currentYield: 12.5, aum: "KES 210B", paybill: "N/A", isHalal: false, riskLevel: "Low", managementFee: 1.5, inceptionDate: "Jan 1980", description: "Institutional-grade retirement solution.", email: "service@oldmutualkenya.com", phone: "+254 711 010 000", website: "https://oldmutual.co.ke", history3Year: JSON.stringify(Array.from({ length: 36 }, (_, i) => 10 + Math.random() * 2)) }
    ];

    for (const provider of providers) {
        await prisma.provider.upsert({
            where: { slug: provider.slug },
            update: provider,
            create: provider
        });
    }

    const hashedPassword = await bcrypt.hash("Admin@2019", 10);

    // 1. ADMIN ACCOUNT
    await prisma.user.upsert({
        where: { email: "admin@sentill.africa" },
        update: {
            password: hashedPassword,
            role: "ADMIN",
            name: "System Admin"
        },
        create: {
            email: "admin@sentill.africa",
            password: hashedPassword,
            role: "ADMIN",
            name: "System Admin",
            isPremium: true,
            cashBalance: 50000
        }
    });

    // 2. USER ACCOUNT
    await prisma.user.upsert({
        where: { email: "pinch@sentill.africa" },
        update: {
            password: hashedPassword,
            role: "USER",
            name: "Pinch Africa"
        },
        create: {
            email: "pinch@sentill.africa",
            password: hashedPassword,
            role: "USER",
            name: "Pinch Africa",
            isPremium: true,
            cashBalance: 25000
        }
    });

    console.log("✅ [Seed Engine] User Data Synchronized.");
    console.log("✨ [Seed Engine] Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
