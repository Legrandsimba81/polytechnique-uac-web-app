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

  const password = await bcrypt.hash("Kase1234", 12);
    await prisma.user.upsert({
        where: { email: "simba@gmail.com" },
        update: {},
        create: {
            name : "Legrand Simba",
            email: "simba@gmail.com",
            phone: "+243827733286",
            passwordHash: password,
            role: Role.USER,
            emailVerified: new Date(),
        },
    });
    console.log("✅ User simba prêt");

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