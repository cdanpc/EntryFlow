import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const event = {
    id: `qr-checkin-demo-${date}`,
    title: `QR Check-in Demo (${date})`,
    description: "A same-day event for testing attendee registration and staff QR check-in.",
    venue: "Cebu City, Philippines",
    startsAt: new Date(`${date}T23:59:00+08:00`),
    endsAt: new Date(new Date(`${date}T23:59:00+08:00`).getTime() + 60 * 60 * 1000),
    capacity: 30,
    status: "PUBLISHED",
  };
  if (event.startsAt <= new Date()) throw new Error("Today's registration window has closed.");
  await prisma.event.upsert({ where: { id: event.id }, update: event, create: event });
  console.info(`Created ${event.title}.`);
}

main()
  .catch((error) => { console.error("Unable to create same-day demo event.", error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
