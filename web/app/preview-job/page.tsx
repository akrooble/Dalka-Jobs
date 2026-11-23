import { PublicJobDetail } from "../../components/frontend/public-job-detail";
export default async function PreviewJobPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) { return <PublicJobDetail id={(await searchParams).id ?? "missing"} />; }
