import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffSignInForm } from "@/components/staff-sign-in-form";
import { staffReturnPath } from "@/lib/staff-return-path";

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = staffReturnPath((await searchParams).next);
  const session = await auth();
  if (session?.user?.staffId) redirect(next);
  return (
    <main className="detail-shell">
      <header className="detail-topbar"><Link href="/" className="back-link">← <span>Browse events</span></Link><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span className="topbar-spacer" /></header>
      <section className="lookup-panel"><p className="eyebrow">STAFF ACCESS</p><h1>Sign in.</h1><p className="lookup-intro">Sign in to check in attendees and review event registrations.</p><StaffSignInForm next={next} /></section>
    </main>
  );
}
