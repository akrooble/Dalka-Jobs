import { NextRequest, NextResponse } from "next/server";
import { getJobBySlug } from "./lib/job-detail";
import { localApiOrigin } from "./lib/api/origin";
import { knownWorkspacePath } from "./lib/route-boundaries";

// Decide missing-job status before the root loading boundary can start a 200 stream.
export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/jobs/")) {
    if (knownWorkspacePath(request.nextUrl.pathname)) return NextResponse.next();
    return new NextResponse('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Page not found — Dalka Jobs</title></head><body><main id="main-content"><h1>Page not found</h1><p>This workspace address is unavailable.</p><a href="/">Return to Dalka Jobs</a></main></body></html>',{status:404,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }
  const slug = request.nextUrl.pathname.slice("/jobs/".length);
  let missing = false;
  if (process.env.DALKA_WEBSITE_MODE !== "live") missing = !getJobBySlug(slug);
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 180) missing = true;
  else {
    try {
      const result = await fetch(`${localApiOrigin()}/api/v1/public/jobs/${encodeURIComponent(slug)}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
      missing = result.status === 404;
      await result.body?.cancel();
    } catch { /* The page shows a service error; it must not invent a missing record. */ }
  }
  if (missing) return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Job not found — Dalka Jobs</title><style>body{margin:0;background:#f8f8fc;color:#22243b;font-family:Arial,sans-serif}header,main,footer{max-width:1000px;margin:auto;padding:28px}header a{font-size:24px;font-weight:700;text-decoration:none;color:#5850ec}main{padding-block:90px}p{line-height:1.8;max-width:520px}h1{font-size:clamp(32px,6vw,56px);letter-spacing:-2px}.eyebrow{color:#5850ec;font-size:12px;letter-spacing:2px}.button{display:inline-block;background:#5850ec;color:white;padding:16px 22px;text-decoration:none;margin-top:20px}a:focus-visible{outline:3px solid #22243b;outline-offset:5px}footer{border-top:1px solid #ddd;font-size:12px}@media(max-width:600px){main{padding-block:55px}}</style></head><body><header><a href="/" aria-label="Dalka Jobs home">DALKA JOBS.</a></header><main id="main-content"><p class="eyebrow">404 / JOB NOT FOUND</p><h1>That opportunity isn’t here.</h1><p>The vacancy may have closed, or this address may be incorrect. Browse the current opportunities to find your next step.</p><a class="button" href="/#jobs">Browse vacancies →</a></main><footer>Dalka Jobs · Opportunities across Somalia</footer></body></html>`, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  return NextResponse.next();
}
export const config = { matcher: ["/jobs/:path*", "/admin/:path*", "/account/:path*", "/workspace/:path*"] };
