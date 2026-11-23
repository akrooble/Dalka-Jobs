import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export default function NotFound() {
  return <><SiteHeader active="none" /><main id="main-content" className="container state-page" tabIndex={-1}><p className="eyebrow">404 · Page not found</p><h1>That opportunity isn’t here.</h1><p>The address may be incorrect, or this sample page does not exist.</p><Link href="/#jobs" className="button button-primary">Browse the sample jobs ↗</Link></main><SiteFooter /></>;
}
