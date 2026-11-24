const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export function manilaDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function manilaDayBounds(now = new Date()) {
  const manila = new Date(now.getTime() + MANILA_OFFSET_MS);
  const start = new Date(Date.UTC(manila.getUTCFullYear(), manila.getUTCMonth(), manila.getUTCDate()) - MANILA_OFFSET_MS);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}
