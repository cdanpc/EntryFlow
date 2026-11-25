"use client";

type EventOption = { id: string; label: string };

export function StaffEventPicker({ events, selectedId, mobile = false }: { events: EventOption[]; selectedId: string; mobile?: boolean }) {
  const id = mobile ? "mobileEventId" : "eventId";
  return <form method="get" className={mobile ? "mobile-event-picker" : "event-picker"}>
    <label htmlFor={id}>Event</label>
    <select id={id} name="eventId" defaultValue={selectedId} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
      {events.map((event) => <option value={event.id} key={event.id}>{event.label}</option>)}
    </select>
  </form>;
}
