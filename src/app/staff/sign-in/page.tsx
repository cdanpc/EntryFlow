import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffSignInForm } from "@/components/staff-sign-in-form";
import { staffReturnPath } from "@/lib/staff-return-path";
import { MobileNav } from "@/components/mobile-nav";
import { BrandLogo } from "@/components/brand-logo";

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = staffReturnPath((await searchParams).next);
  const session = await auth();
  if (session?.user?.staffId) redirect(next);
  return (
    <main className="detail-shell">
      <header className="detail-topbar sign-in-topbar"><Link className="brand" href="/"><BrandLogo />EntryFlow</Link></header>
      <section className="lookup-panel sign-in-panel"><Link className="attendee-detail-back" href="/"><span aria-hidden="true">&lt;</span> Back to home</Link><h1>Sign in</h1><p className="lookup-intro">Access event check-in and attendee records.</p><StaffSignInForm next={next} /></section>
      <MobileNav role="attendee" current="signin" desktopOnly />
    </main>
  );
}
