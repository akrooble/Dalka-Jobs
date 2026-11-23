export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export type Session = { state: "anonymous" | "pending" | "full" | "applicant"; csrfToken: string; subject?: "applicant"; role?: "super_admin" | "recruiter" | "company_admin"; enrollmentRequired?: boolean; recoveryCodes?: string[] };
export type Company = { id: string; name: string; employerType: string; version: number; createdAt: string; updatedAt: string };
export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };
export type PublicJob = { id: string; slug: string; title: string; description: string; employer: string; employerType: string; locationId: string; location: string; categoryId: string; category: string; jobType: string; arrangement: string; applicationMethod: "Company website" | "Email" | "WhatsApp" | "Dalka recruitment"; destination: string; postedAt: string; closesAt: string };
export type ListEntry = { id: string; kind: "location" | "category"; label: string };
export type ManagedListEntry = ListEntry & { active: boolean; version: number; updatedAt: string; jobCount: number };
export type AdminJob = PublicJob & { companyId: string; status: "draft" | "published" | "archived"; version: number; updatedAt: string };
export type JobSummary = Pick<AdminJob, "id" | "slug" | "title" | "employer" | "status" | "version" | "closesAt">;

// The browser sends credentials exclusively to the same-origin API boundary.
export async function api<T>(path: string, options: { method?: "POST" | "PATCH"; body?: unknown; csrf?: string; signal?: AbortSignal } = {}): Promise<T> {
  if (!/^\/(session|auth\/[a-z/]+|applicant\/(?:profile|cv(?:\/remove)?|deletion\/(?:request|confirm))|admin\/(?:(?:companies|jobs|users|assignments)(?:\/[a-f0-9]{32})?|overview|activity|lists(?:\/(?:cat|loc)-[a-z0-9]+(?:-[a-z0-9]+)*)?)|(?:recruiter|company)\/jobs|public\/(?:lists|jobs(?:\/[a-z0-9-]+)?))(?:\?[^#]*)?$/.test(path)) throw new ApiError(400, "invalid_path", "Invalid API request.");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, { method: options.method ?? "GET", credentials: "same-origin", cache: "no-store", redirect: "error", signal: options.signal, headers: options.method ? { "Content-Type": "application/json", "X-CSRF-Token": options.csrf ?? "" } : {}, body: options.method ? JSON.stringify(options.body ?? {}) : undefined });
  } catch (error) { if (error instanceof Error && error.name === "AbortError") throw error; throw new ApiError(503, "service_unavailable", "The service could not be reached. Try again."); }
  const value: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = value as { error?: { code?: string; message?: string } } | null;
    throw new ApiError(response.status, failure?.error?.code ?? "service_unavailable", failure?.error?.message || "The request could not be completed. Please try again.");
  }
  if (value === null) throw new ApiError(503, "invalid_response", "The service returned an unreadable response.");
  return value as T;
}
export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Session>;
  if (typeof s.csrfToken !== "string" || !/^[a-f0-9]{64}$/.test(s.csrfToken)) return false;
  if (s.state === "applicant") return s.subject === "applicant" && s.role === undefined && s.enrollmentRequired === undefined && s.recoveryCodes === undefined;
  if (s.subject !== undefined) return false;
  if (s.state === "full") return ["super_admin", "recruiter", "company_admin"].includes(s.role ?? "") && s.enrollmentRequired === undefined && (s.recoveryCodes === undefined || Array.isArray(s.recoveryCodes) && s.recoveryCodes.length === 10 && s.recoveryCodes.every(code => typeof code === "string" && /^[a-f0-9]{32}$/.test(code)));
  if (s.state === "pending") return s.role === undefined && s.recoveryCodes === undefined && (s.enrollmentRequired === undefined || typeof s.enrollmentRequired === "boolean");
  return s.state === "anonymous" && s.role === undefined && s.recoveryCodes === undefined && s.enrollmentRequired === undefined;
}
export function errorMessage(error: unknown) { return error instanceof ApiError ? error.message : "The service is unavailable. Try again."; }
