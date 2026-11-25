export type NavigationIconName = "home" | "search" | "scan" | "ticket" | "activity" | "signin";
export function NavigationIcon({ name }: { name: NavigationIconName }) {
  if (name === "signin") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v16h-6M3 12h12m-4-4 4 4-4 4" /></svg>;
  if (name === "activity") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "ticket") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Z" /><path d="M15 5v3m0 3v2m0 3v3" /></svg>;
  if (name === "home") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z" /></svg>;
  if (name === "scan") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4M9 9h6v6H9z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>;
}
