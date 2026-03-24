import { PrismaClient } from "@prisma/client";
import ProvidersPageClient from "./ProvidersPageClient";

const prisma = new PrismaClient();

export default async function ProvidersPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: 'desc' }
  });

  // Serialize BigInt if needed, though Prisma with SQLite usually handles it.
  // We'll pass them to the client component for search/filter state.
  return <ProvidersPageClient providers={providers} />;
}
