import Link from "next/link";
import type { StaffAttendeeData } from "@/lib/staff-attendees";

export function StaffAttendeeList({ data, eventId }: { data: StaffAttendeeData; eventId: string }) {
  return <ol className="staff-mobile-list" start={(data.page - 1) * 50 + 1} aria-label="Attendees">{data.rows.map((row, index) => {
    const checked = row.status === "CHECKED_IN";
    const status = checked ? "Checked in" : row.status === "CONFIRMED" ? "Awaiting" : row.status === "WAITLISTED" ? "Waitlisted" : "Cancelled";
    return <li key={row.id}><Link href={`/staff/attendees/${row.id}?eventId=${encodeURIComponent(eventId)}`}><span className="attendee-row-number" aria-hidden="true">{(data.page - 1) * 50 + index + 1}.</span><span className="attendee-row-name">{row.fullName}</span><span className={checked ? "row-checked" : "row-awaiting"}>{status}</span></Link></li>;
  })}</ol>;
}
