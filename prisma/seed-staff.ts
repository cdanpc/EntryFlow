import { PrismaClient, StaffRole } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedStaff(prisma: PrismaClient) {
  const accounts = [
    {
      username: "organizer",
      name: "Demo Organizer",
      role: StaffRole.ORGANIZER,
      password: process.env.DEMO_ORGANIZER_PASSWORD,
    },
    {
      username: "staff",
      name: "Demo Door Staff",
      role: StaffRole.DOOR_STAFF,
      password: process.env.DEMO_DOOR_STAFF_PASSWORD,
    },
  ];

  for (const account of accounts) {
    if (!account.password) {
      throw new Error(`Set ${account.role === StaffRole.ORGANIZER ? "DEMO_ORGANIZER_PASSWORD" : "DEMO_DOOR_STAFF_PASSWORD"} before seeding.`);
    }
  }

  for (const account of accounts) {
    const passwordHash = await hash(account.password!, 12);
    await prisma.staffUser.upsert({
      where: { username: account.username },
      update: { name: account.name, passwordHash, role: account.role },
      create: { name: account.name, username: account.username, passwordHash, role: account.role },
    });
  }
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/prisma/seed-staff.ts")) {
  const prisma = new PrismaClient();
  seedStaff(prisma)
    .then(() => console.info("EntryFlow demo staff accounts seeded."))
    .catch((error: unknown) => {
      console.error("Unable to seed EntryFlow demo staff accounts.", error);
      process.exitCode = 1;
    })
    .finally(async () => prisma.$disconnect());
}
