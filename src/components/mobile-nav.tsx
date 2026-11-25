"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: "home" | "search" | "scan" | "ticket" | "activity" };

function NavIcon({ name }: { name: Item["icon"] }) {
  if (name === "activity") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "ticket") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Z" /><path d="M15 5v3m0 3v2m0 3v3" /></svg>;
  if (name === "home") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z" /></svg>;
  if (name === "scan") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4M9 9h6v6H9z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>;
}

export function MobileNav({ role, current, revealOnScroll = false, eventId }: { role: "attendee" | "staff"; current: "home" | "search" | "scan" | "activity"; revealOnScroll?: boolean; eventId?: string }) {
  const [visible, setVisible] = useState(!revealOnScroll);
  const [selectedEvent, setSelectedEvent] = useState(eventId ?? "");
  useEffect(() => {
    if (role !== "staff") return;
    const selected = eventId || new URLSearchParams(window.location.search).get("eventId") || sessionStorage.getItem("entryflow-staff-event") || "";
    setSelectedEvent(selected);
    if (role === "staff" && selected) sessionStorage.setItem("entryflow-staff-event", selected);
  }, [eventId, role]);
  useEffect(() => {
    if (!revealOnScroll) return;
    const update = () => setVisible(window.scrollY > 120);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [revealOnScroll]);
  const items: Item[] = role === "attendee"
    ? [{ href: "/", label: "Home", icon: "home" }, { href: "/tickets", label: "Find Ticket", icon: "ticket" }]
    : [{ href: "/staff", label: "Attendees", icon: "home" }, { href: "/staff/scan", label: "Scan", icon: "scan" }, { href: "/staff/activity", label: "Activity", icon: "activity" }];
  return <nav className={`mobile-nav ${role === "staff" ? "staff-dock" : ""} ${visible ? "" : "mobile-nav-hidden"}`} aria-label={`${role === "staff" ? "Staff" : "Attendee"} mobile navigation`} inert={!visible}><div className="mobile-nav-inner">{items.map((item) => {
    const active = current === item.icon || (item.icon === "ticket" && current === "search");
    const href = role === "staff" && selectedEvent ? `${item.href}?eventId=${encodeURIComponent(selectedEvent)}` : item.href;
    return <Link key={item.href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><NavIcon name={item.icon} /><span>{item.label}</span></Link>;
  })}</div></nav>;
}
