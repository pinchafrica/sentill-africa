import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isPremium: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let output = `\n=== REGISTERED USERS (${users.length} total) ===\n\n`;
  users.forEach((u, i) => {
    output += `[${i + 1}] ${u.name}\n`;
    output += `    Email     : ${u.email}\n`;
    output += `    Role      : ${u.role}\n`;
    output += `    Premium   : ${u.isPremium}\n`;
    output += `    Joined    : ${u.createdAt?.toISOString?.() ?? "N/A"}\n\n`;
  });

  fs.writeFileSync("scripts/users-output.txt", output);
  console.log("Written to scripts/users-output.txt");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
