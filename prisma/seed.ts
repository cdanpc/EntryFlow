import { PrismaClient, EventStatus, StaffRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.DEMO_STAFF_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("Set DEMO_STAFF_PASSWORD to a local password of at least 12 characters before seeding.");
  }

  const now = new Date();
  const eventDate = (daysAhead: number, hour: number) => {
    const manilaValue = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    manilaValue.setUTCDate(manilaValue.getUTCDate() + daysAhead);
    manilaValue.setUTCHours(hour, 0, 0, 0);
    return new Date(manilaValue.getTime() - 8 * 60 * 60 * 1000);
  };

  const events = [
    {
      id: "cebu-dev-meetup-2026",
      title: "Cebu Dev Meetup 2026",
      description: "A practical evening for Cebu's developer community to share ideas, meet peers, and learn together.",
      venue: "Cebu City, Philippines",
      startsAt: eventDate(14, 18),
      endsAt: eventDate(14, 21),
      capacity: 30,
      status: EventStatus.PUBLISHED,
    },
    {
      id: "product-design-exchange",
      title: "Product Design Exchange",
      description: "A focused community session on building clearer, more useful digital products.",
      venue: "Cebu City, Philippines",
      startsAt: eventDate(28, 13),
      endsAt: eventDate(28, 16),
      capacity: 60,
      status: EventStatus.PUBLISHED,
    },
    {
      id: "community-tech-forum-full",
      title: "Community Tech Forum",
      description: "A full-capacity event fixture for checking registration availability behavior.",
      venue: "Cebu City, Philippines",
      startsAt: eventDate(35, 9),
      endsAt: eventDate(35, 12),
      capacity: 1,
      status: EventStatus.PUBLISHED,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({ where: { id: event.id }, update: event, create: event });
  }

  const passwordHash = await hash(password, 12);
  await prisma.staffUser.upsert({
    where: { username: "organizer" },
    update: { name: "Demo Organizer", passwordHash, role: StaffRole.ORGANIZER },
    create: { name: "Demo Organizer", username: "organizer", passwordHash, role: StaffRole.ORGANIZER },
  });

  // Keep one confirmed ticket on the third event so it reliably exercises the full state.
  await prisma.registration.upsert({
    where: { ticketCode: "DEMO-FULL-0001" },
    update: { status: "CONFIRMED" },
    create: {
      eventId: "community-tech-forum-full",
      fullName: "Demo Attendee",
      email: "full-event@example.test",
      normalizedEmail: "full-event@example.test",
      mobile: "09170000001",
      ticketCode: "DEMO-FULL-0001",
    },
  });

  console.info("EntryFlow demo data seeded.");
}

main()
  .catch((error: unknown) => {
    console.error("Unable to seed EntryFlow demo data.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
