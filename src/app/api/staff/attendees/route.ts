import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffAttendees } from "@/lib/staff-attendees";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.staffId) return NextResponse.json({ message: "Your session expired. Sign in again." }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const eventId = params.get("eventId") ?? "";
  try {
    const event = await prisma.event.findFirst({ where: { id: eventId, status: { in: ["PUBLISHED", "CLOSED"] } }, select: { id: true } });
    if (!event) return NextResponse.json({ message: "Event unavailable. Choose another event." }, { status: 404 });
    const data = await getStaffAttendees(event.id, (params.get("q") ?? "").slice(0, 100), params.get("status") ?? "", Number(params.get("page") ?? 1), session.user.role === "ORGANIZER", params.get("activity") === "1");
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "Unable to load attendees. Please try again." }, { status: 503 });
  }
}
