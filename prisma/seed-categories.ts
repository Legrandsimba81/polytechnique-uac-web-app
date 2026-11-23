import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const categories = [
  { name: "Actualités", slug: "actualites" },
  { name: "Communiqués", slug: "communiques" },
  { name: "Événements", slug: "evenements" },
  { name: "Innovations & Projets", slug: "innovations" },
  { name: "Vie estudiantine", slug: "vie-estudiantine" },
  { name: "Recherche & Sciences", slug: "recherche-sciences" },
  { name: "Formation & Académique", slug: "formation-academique" },
  { name: "Portraits & Interviews", slug: "portraits-interviews" },
  { name: "Stages & Opportunités", slug: "opportunites" },
  { name: "Finance & Transparence", slug: "finance-transparence" },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    console.log(`✅ ${c.name}`);
  }
}

main().finally(() => prisma.$disconnect());