"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NavigationIcon, type NavigationIconName } from "@/components/navigation-icon";
import { BrandLogo } from "@/components/brand-logo";

type Item = { href: string; label: string; icon: NavigationIconName; desktopOnly?: boolean };

export function MobileNav({ role, current, revealOnScroll = false, eventId, desktopOnly = false }: { role: "attendee" | "staff"; current: "home" | "search" | "scan" | "activity" | "signin"; revealOnScroll?: boolean; eventId?: string; desktopOnly?: boolean }) {
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
    const compact = window.matchMedia("(max-width: 1024px)");
    const update = () => setVisible(!compact.matches || window.scrollY > 120);
    update();
    window.addEventListener("scroll", update, { passive: true });
    compact.addEventListener("change", update);
    return () => { window.removeEventListener("scroll", update); compact.removeEventListener("change", update); };
  }, [revealOnScroll]);
  const items: Item[] = role === "attendee"
    ? [{ href: "/", label: "Home", icon: "home" }, { href: "/tickets", label: "Find Ticket", icon: "ticket" }, { href: "/staff/sign-in", label: "Sign in", icon: "signin", desktopOnly: true }]
    : [{ href: "/staff", label: "Attendees", icon: "home" }, { href: "/staff/scan", label: "Scan", icon: "scan" }, { href: "/staff/activity", label: "Activity", icon: "activity" }];
  const staffHome = selectedEvent ? `/staff?eventId=${encodeURIComponent(selectedEvent)}` : "/staff";
  return <nav className={`mobile-nav ${role === "staff" ? "staff-dock" : ""} ${desktopOnly ? "desktop-only-nav" : ""} ${visible ? "" : "mobile-nav-hidden"}`} aria-label={`${role === "staff" ? "Staff" : "Attendee"} navigation`} inert={!visible}><Link className="desktop-nav-brand" href={role === "staff" ? staffHome : "/"} aria-label="EntryFlow home"><BrandLogo /><span>EntryFlow</span></Link><div className="mobile-nav-inner">{items.map((item) => {
    const active = current === item.icon || (item.icon === "ticket" && current === "search");
    const [path, hash] = item.href.split("#");
    const href = role === "staff" && selectedEvent ? `${path}?eventId=${encodeURIComponent(selectedEvent)}${hash ? `#${hash}` : ""}` : item.href;
    return <Link key={item.href} href={href} className={`${active ? "active" : ""} ${item.desktopOnly ? "desktop-nav-item" : ""} ${item.icon === "signin" ? "desktop-nav-signin" : ""}`} aria-current={active ? "page" : undefined}><NavigationIcon name={item.icon} /><span>{item.label}</span></Link>;
  })}</div></nav>;
}
