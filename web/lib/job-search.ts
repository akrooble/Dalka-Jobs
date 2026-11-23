import { PREVIEW_NOW, type DemoJob } from "./demo-jobs.ts";
import { isClosed } from "./job-detail.ts";

export type JobFilters = {
  keyword: string; location: string; category: string;
  employerType?: string; jobType?: string; closingSoon?: boolean; sort?: "newest" | "closing";
};

export function emptyFilters(): JobFilters {
  return { keyword: "", location: "", category: "", employerType: "", jobType: "", closingSoon: false, sort: "newest" };
}

// All keyword terms must appear; location/category are exact, combined filters.
// This is preview-only presentation logic, not the future API search contract.
export function filterJobs(jobs: readonly DemoJob[], filters: JobFilters, now = PREVIEW_NOW): DemoJob[] {
  const terms = filters.keyword.trim().toLocaleLowerCase("en").split(/\s+/).filter(Boolean);
  const matches = jobs.filter((job) => {
    if (filters.location && job.location !== filters.location) return false;
    if (filters.category && job.category !== filters.category) return false;
    if (filters.employerType && job.employerType !== filters.employerType) return false;
    if (filters.jobType && job.type !== filters.jobType) return false;
    if (filters.closingSoon && (isClosed(job, now) || Date.parse(job.closesAt) > Date.parse(now) + 7 * 24 * 60 * 60 * 1000)) return false;
    const searchable = [job.title, job.employer, job.category, job.summary].join(" ").toLocaleLowerCase("en");
    return terms.every((term) => searchable.includes(term));
  });
  return matches.sort((a, b) => {
    if (filters.sort === "closing") {
      const closedOrder = Number(isClosed(a, now)) - Number(isClosed(b, now));
      if (closedOrder) return closedOrder;
      return Date.parse(a.closesAt) - Date.parse(b.closesAt) || a.id.localeCompare(b.id);
    }
    return Date.parse(b.postedAt) - Date.parse(a.postedAt) || a.id.localeCompare(b.id);
  });
}
