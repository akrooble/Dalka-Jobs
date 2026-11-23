import { JobBrowser } from "../components/job-browser";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { LiveJobBrowser } from "../components/live-job-browser";

export const dynamic = "force-dynamic";
export function generateMetadata() { return process.env.DALKA_WEBSITE_MODE === "live" ? { description: "Browse current published vacancies on Dalka Jobs. Local development preview; on-site applications are not open." } : {}; }

export default function HomePage() {
  return (
    <>
      <SiteHeader live={process.env.DALKA_WEBSITE_MODE === "live"} />
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" /> Somalia employment portal · Local preview</p>
              <h1>Connecting Somalia’s talent with<br className="desktop-break" /> <span className="brand-text">new opportunities</span></h1>
              <p className="hero-description">Explore opportunities across humanitarian organisations, private enterprises and public institutions. Find work in Mogadishu, Hargeisa, Garowe and beyond.</p>
            </div>
          </div>
        </section>
        {process.env.DALKA_WEBSITE_MODE === "live" ? <LiveJobBrowser /> : <JobBrowser />}
      </main>
      <SiteFooter live={process.env.DALKA_WEBSITE_MODE === "live"} />
    </>
  );
}
