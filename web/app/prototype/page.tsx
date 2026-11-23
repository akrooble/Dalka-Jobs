import Link from "next/link";
import { areaLabels, prototypeScreens, prototypeHref, type PrototypeArea } from "../../lib/prototype";

export default function PrototypeIndex() {
  return <main className="proto-index" id="main-content"><Link className="wordmark" href="/">DALKA<span className="brand-text">JOBS</span>.</Link><div className="proto-index-heading"><p className="eyebrow">The frontend collection</p><h1>One platform.<br /><span>Many ways forward.</span></h1><p>Explore the applicant experience and the workspaces behind Dalka Jobs. Every journey uses fictional data.</p></div><div className="proto-banner"><strong>Screen prototypes only</strong><span>These public previews do not sign you in or grant a role. Live services, data protection and final workflow policies remain pending.</span></div><div className="proto-journeys">{(Object.keys(areaLabels) as PrototypeArea[]).map((area, index) => {
    const screens = prototypeScreens.filter((screen) => screen.area === area);
    return <section className="proto-journey" key={area}><p className="eyebrow">{String(index + 1).padStart(2, "0")} / {screens.length} screens</p><h2>{areaLabels[area]}</h2><p>{screens[0].description}</p><ul>{screens.map((screen) => <li key={screen.slug}><Link href={prototypeHref(screen)}>{screen.slug.split("-").join(" ")}<span aria-hidden="true">↗</span></Link></li>)}</ul></section>;
  })}</div><div className="proto-index-footer"><Link href="/">Explore the public website →</Link><Link href="/ui-preview">Shared component gallery →</Link></div></main>;
}
