/** Use Supavisor transaction pooling for application queries, leaving CLI URLs untouched. */
export function runtimeDatabaseUrl(value: string | undefined) {
  if (!value) return undefined;
  let url: URL;
  try { url = new URL(value); } catch { return value; }
  if (!/^postgres(ql)?:$/.test(url.protocol) || !url.hostname.endsWith(".pooler.supabase.com")) return value;
  if (url.port === "5432") url.port = "6543";
  if (url.port !== "6543") return value;
  url.searchParams.set("pgbouncer", "true");
  if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "1");
  return url.toString();
}
