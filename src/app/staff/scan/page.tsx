import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckInForm } from "@/components/check-in-form";
import { MobileNav } from "@/components/mobile-nav";
import { StaffHeader } from "@/components/staff-header";

export const dynamic = "force-dynamic";

export default async function StaffScanPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const { eventId } = await searchParams;
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  return <main className="staff-shell staff-scan-page"><StaffHeader role={session.user.role} eventId={eventId} /><CheckInForm eventId="" enabled scannerOnly /><MobileNav role="staff" current="scan" eventId={eventId} /></main>;
}
