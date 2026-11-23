import { NextRequest, NextResponse } from "next/server";
import { localApiOrigin } from "../../../../lib/api/origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function unavailable(status = 503, code = "service_unavailable") { return NextResponse.json({ error: { code, message: "The service is unavailable. Refresh and try again." } }, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const configured = process.env.DALKA_WEB_ORIGIN ?? "http://127.0.0.1:3000";
  let origin: URL;
  try { origin = new URL(configured); } catch { return unavailable(); }
  // This increment is loopback development only; no production exposure is configured.
  if (origin.protocol !== "http:" || origin.hostname !== "127.0.0.1" || !origin.port || origin.origin !== configured) return unavailable();
  if (!["GET", "POST", "PATCH"].includes(request.method)) return unavailable(405, "method_not_allowed");
  if (request.method !== "GET" && request.headers.get("Origin") !== configured) return unavailable(403, "origin_rejected");
  const { path } = await context.params;
  if (path.some((part) => !/^[a-zA-Z0-9-]+$/.test(part))) return unavailable(404, "not_found");
  let apiOrigin: string;
  try { apiOrigin = localApiOrigin(); } catch { return unavailable(); }
  const destination = new URL(`/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, apiOrigin);
  const headers = new Headers();
  for (const name of ["Origin", "Content-Type", "X-CSRF-Token"]) { const value = request.headers.get(name); if (value) headers.set(name, value); }
  const sessions = request.cookies.getAll("dalka_session");
  if (sessions.length === 1 && /^[a-f0-9]{64}$/.test(sessions[0].value)) headers.set("Cookie", `dalka_session=${sessions[0].value}`);
  let body: ArrayBuffer | undefined;
  if (request.method !== "GET") {
    const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let length = 0;
    if (reader) { for (;;) { const item = await reader.read(); if (item.done) break; length += item.value.byteLength; if (length > 65536) { await reader.cancel(); return unavailable(413, "request_too_large"); } chunks.push(item.value); } }
    const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; } body = bytes.buffer;
  }
  try {
    const response = await fetch(destination, { method: request.method, headers, body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000) });
    const safe = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    for (const cookie of response.headers.getSetCookie()) if (/^dalka_session=(?:[a-f0-9]{64})?;/.test(cookie)) safe.append("Set-Cookie", cookie);
    return new NextResponse(response.body, { status: response.status, headers: safe });
  } catch { return unavailable(); }
}
export const GET = forward;
export const POST = forward;
export const PATCH = forward;
