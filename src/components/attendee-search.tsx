"use client";

export function AttendeeSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="attendee-search-field"><label className="attendee-search-label sr-only" htmlFor="attendee-search">Name or ticket code</label><div className="attendee-search"><input id="attendee-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Name or ticket code" maxLength={100} autoComplete="off" />{value && <button type="button" onClick={() => onChange("")} aria-label="Clear attendee search">Clear</button>}</div></div>;
}

export function AttendeeFilters({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="mobile-filter attendee-filters" role="group" aria-label="Attendance status">{[{ value: "", label: "All" }, { value: "awaiting", label: "Awaiting" }, { value: "checked", label: "Checked in" }].map((filter) => <button type="button" key={filter.value} className={value === filter.value ? "active" : ""} aria-pressed={value === filter.value} onClick={() => onChange(filter.value)}>{filter.label}</button>)}</div>;
}
