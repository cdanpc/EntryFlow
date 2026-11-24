export function formatCebuDateRange(startsAt: Date, endsAt: Date) {
  const date = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startsAt);

  const time = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  });

  return `${date} · ${time.format(startsAt)}–${time.format(endsAt)}`;
}
