import Link from "next/link";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function InformationPage({ title, intro, children, active = "none", draft = false }: {
  title: string; intro: string; children: React.ReactNode; active?: "about" | "contact" | "none"; draft?: boolean;
}) {
  return <><SiteHeader active={active} /><main id="main-content" className="information-main" tabIndex={-1}><div className="container"><Link href="/" className="back-link">← Back to jobs</Link><div className="information-heading"><p className="eyebrow">{draft ? "Draft · For preview only" : "Get to know Dalka Jobs"}</p><h1>{title}</h1><p>{intro}</p></div><div className="information-body">{children}</div></div></main><SiteFooter /></>;
}
