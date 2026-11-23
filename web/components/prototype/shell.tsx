import Link from "next/link";
import type { ReactNode } from "react";
import { areaLabels, prototypeScreens, prototypeHref, type PrototypeArea } from "../../lib/prototype";

function Navigation({ area, current, label }: { area: PrototypeArea; current: string; label: string }) {
  return <nav className="panel-navigation proto-navigation" aria-label={label}>{prototypeScreens.filter((screen) => screen.area === area).map((screen, index) => <Link key={screen.slug} href={prototypeHref(screen)} aria-current={current === screen.slug ? "page" : undefined}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{screen.slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}</Link>)}</nav>;
}

export function PrototypeShell({ area, current, children }: { area: PrototypeArea; current: string; children: ReactNode }) {
  return <div className="panel-shell proto-shell"><a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="panel-sidebar"><Link className="wordmark" href="/" aria-label="Dalka Jobs public website"><span className="brand-mark" aria-hidden="true">D<span /></span><span>DALKA<span className="brand-text">JOBS</span>.</span></Link><p className="panel-sidebar-label eyebrow">{areaLabels[area]} / Prototype</p><Navigation area={area} current={current} label={`${areaLabels[area]} prototype screens`} /><div className="panel-sidebar-note"><p>Explore the design</p><span>Fictional workspace. No signed-in account.</span><Link href="/prototype">All prototype journeys →</Link><Link href="/">Public website →</Link></div></aside>
    <div className="panel-workspace"><header className="panel-header"><div><span className="eyebrow">Dalka Jobs / {areaLabels[area]}</span><p>Room for better work.</p></div><Link href="/prototype" className="sample-badge">Screen prototypes · Fictional data</Link></header>
      <details className="panel-mobile-navigation"><summary>{areaLabels[area]} screens</summary><Navigation area={area} current={current} label="Mobile prototype screens" /><Link className="panel-public-link" href="/prototype">All journeys →</Link></details>
      <main id="main-content" className="panel-main" tabIndex={-1}><div className="proto-banner"><strong>Design preview</strong><span>All people, jobs and amounts are fictional. No account, application or payment is connected. Use sample values only.</span></div>{children}</main>
    </div>
  </div>;
}
