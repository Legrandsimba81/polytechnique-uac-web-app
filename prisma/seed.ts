import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 12);

  await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL! },
    update: {},
    create: {
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      phone: process.env.SUPER_ADMIN_PHONE,
      passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  if (process.env.FINANCE_USER_EMAIL && process.env.FINANCE_USER_PASSWORD) {
  const financeHash = await bcrypt.hash(process.env.FINANCE_USER_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: process.env.FINANCE_USER_EMAIL },
    update: {},
    create: {
      name: process.env.FINANCE_USER_NAME ?? "Finance",
      email: process.env.FINANCE_USER_EMAIL,
      phone: process.env.FINANCE_USER_PHONE,
      passwordHash: financeHash,
      role: "FINANCE",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Finance user prêt");
}
  console.log("✅ Super admin prêt");
}

main().finally(() => prisma.$disconnect());