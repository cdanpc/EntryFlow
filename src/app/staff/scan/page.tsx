import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckInForm } from "@/components/check-in-form";
import { MobileNav } from "@/components/mobile-nav";

export const dynamic = "force-dynamic";

export default async function StaffScanPage() {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  return <main className="staff-shell staff-scan-page"><header className="staff-header"><Link className="brand" href="/staff"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span className="role-pill">Scan QR</span></header><CheckInForm eventId="" enabled scannerOnly /><MobileNav role="staff" current="scan" /></main>;
}
