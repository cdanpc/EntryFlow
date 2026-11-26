"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StaffAttendeeData } from "@/lib/staff-attendees";
import { AttendeeSearch, AttendeeFilters } from "@/components/attendee-search";
import { MobileNav } from "@/components/mobile-nav";
import { AttendeeRowsSkeleton } from "@/components/loading-indicator";
import { StaffAttendeeList } from "@/components/staff-attendee-list";

export function StaffAttendees({ events, eventId, initial, initialQuery = "", initialStatus = "", organizer, activity = false }: { events: { id: string; title: string; startsAt: string }[]; eventId: string; initial: StaffAttendeeData | null; initialQuery?: string; initialStatus?: string; organizer: boolean; activity?: boolean }) {
  const [selected, setSelected] = useState(eventId);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!selected) return;
    const controller = new AbortController();
    setLoading(true); setError("");
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ eventId: selected, q: query, status, page: String(page) }).toString();
    window.history.replaceState(null, "", url);
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ eventId: selected, q: query, status, page: String(page) });
      if (activity) params.set("activity", "1");
      try {
        const response = await fetch(`/api/staff/attendees?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Sign in again." : "Unable to load attendees. Try again.");
        const result: StaffAttendeeData = await response.json();
        if (controller.signal.aborted) return;
        setData(result);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load attendees."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selected, query, status, page, retry, activity]);
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const time = (value: string) => new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return <><section className={`staff-attendees-panel ${activity ? "staff-activity" : ""}`}><h1>{activity ? "Activity" : "Attendees"}</h1>{events.length ? <>
    <div className="staff-directory-controls"><div className="mobile-event-picker"><label htmlFor="attendee-event">Event</label><select id="attendee-event" value={selected} onChange={(event) => update(setSelected, event.target.value)}>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></div>{!activity && <AttendeeSearch value={query} onChange={(value) => update(setQuery, value)} />}</div>
    <div className="mobile-counts staff-summary"><span>{data?.registered ?? 0} registered</span><span>{data?.checkedIn ?? 0} checked in</span><span>{(data?.registered ?? 0) - (data?.checkedIn ?? 0)} awaiting</span>{organizer && <span>{data?.waitlisted ?? 0} waitlisted</span>}</div>
    {!activity && <AttendeeFilters value={status} onChange={(value) => update(setStatus, value)} />}
    {loading && <AttendeeRowsSkeleton label={activity ? "Loading activity…" : "Loading attendees…"} />}
    <div className="attendee-feedback sr-only" role="status" aria-live="polite">{!loading && !error ? `${data?.total ?? 0} ${activity ? "check-ins" : "attendees"}` : ""}</div>
    {error && <div className="form-alert" role="alert">{error} <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button> <Link href="/staff/sign-in">Sign in</Link></div>}
    <div hidden={loading} aria-busy={loading} inert={loading || !!error} style={{ opacity: loading || error ? .5 : 1 }}>{!error && data && <StaffAttendeeList data={data} eventId={selected} />}<div className="attendee-table-wrap staff-desktop-results"><table className="attendee-table staff-responsive-table"><thead><tr><th>Attendee</th>{organizer && <th>Contact</th>}<th>Ticket code</th><th>{activity ? "Checked in" : "Registered"}</th><th>Status</th></tr></thead><tbody>{!error && data?.rows.map((row) => <tr key={row.id}>
      <td data-label="Attendee"><Link href={`/staff/attendees/${row.id}?eventId=${encodeURIComponent(selected)}`}>{row.fullName}</Link></td>{organizer && <td data-label="Contact"><span>{row.email}</span><span>{row.mobile}</span></td>}<td data-label="Ticket code"><code>{row.manualCode}</code></td><td data-label={activity ? "Checked in" : "Registered"}>{time(activity && row.checkedInAt ? row.checkedInAt : row.registeredAt)}</td><td data-label="Status"><span className={row.status === "CHECKED_IN" ? "row-checked" : "row-awaiting"}>{row.status === "CHECKED_IN" ? "✓ Checked in" : row.status === "CONFIRMED" ? "○ Awaiting" : row.status === "WAITLISTED" ? "Waitlisted" : "Cancelled"}</span></td>
    </tr>)}</tbody></table></div>{!error && data?.rows.length === 0 && <p className="staff-empty">{activity ? "No check-ins yet for this event." : query ? "No attendees match this search and status. Try another name or code, or clear the search." : "No attendees in this view. Try another status or event."}</p>}</div>
    {data && data.pages > 1 && <div className="pagination"><span>Page {data.page} of {data.pages}</span><div><button disabled={loading || data.page <= 1} onClick={() => setPage(data.page - 1)}>Previous</button><button disabled={loading || data.page >= data.pages} onClick={() => setPage(data.page + 1)}>Next</button></div></div>}
  </> : <p className="staff-empty">No events are available.</p>}</section><MobileNav role="staff" current={activity ? "activity" : "home"} eventId={selected} /></>;
}
