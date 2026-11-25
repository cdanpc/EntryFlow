import { StaffDirectory, type StaffDirectoryParams } from "@/components/staff-directory";
export const dynamic = "force-dynamic";
export default async function StaffActivity({ searchParams }: { searchParams: Promise<StaffDirectoryParams> }) { return <StaffDirectory params={await searchParams} activity />; }
