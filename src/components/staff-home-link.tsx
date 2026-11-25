"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
export function StaffHomeLink({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const href = eventId ? `/staff?eventId=${encodeURIComponent(eventId)}` : "/staff";
  return <Link className="brand" href={href} aria-label="EntryFlow staff home" onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const selected = new URLSearchParams(window.location.search).get("eventId") || eventId || sessionStorage.getItem("entryflow-staff-event");
    if (selected) { event.preventDefault(); router.push(`/staff?eventId=${encodeURIComponent(selected)}`); }
  }}><BrandLogo />EntryFlow</Link>;
}
