import { api, ApiError, isSession, type Session } from "../api/client.ts";
export async function getSession(signal?: AbortSignal): Promise<Session> {
  const value = await api<unknown>("/session", { signal });
  if (!isSession(value)) throw new ApiError(503, "invalid_response", "Your session could not be verified. Try again.");
  return value;
}
export async function sessionAction(path: string, session: Session, body: unknown): Promise<Session> {
  const value = await api<unknown>(path, { method: "POST", csrf: session.csrfToken, body });
  if (!isSession(value)) throw new ApiError(503, "invalid_response", "Your session could not be verified. Refresh before continuing.");
  return value;
}
