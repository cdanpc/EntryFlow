import { redirect } from "next/navigation";
export default async function StaffSearch({ searchParams }: { searchParams: Promise<{ eventId?: string; q?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.eventId) query.set("eventId", params.eventId);
  if (params.q) query.set("q", params.q.slice(0, 100));
  redirect(`/staff?${query}`);
}
