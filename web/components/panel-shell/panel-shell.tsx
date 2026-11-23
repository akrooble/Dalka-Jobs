import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/ui-preview#components", label: "Components", number: "01" },
  { href: "/ui-preview#fields", label: "Fields & validation", number: "02" },
  { href: "/ui-preview#tables", label: "Tables & pagination", number: "03" },
  { href: "/ui-preview#states", label: "Feedback & states", number: "04" },
];

function Navigation({ label }: { label: string }) {
  return <nav className="panel-navigation" aria-label={label}>{navigation.map((item) => <Link key={item.href} href={item.href}><span aria-hidden="true">{item.number}</span>{item.label}</Link>)}</nav>;
}

export function PanelShell({ children }: { children: ReactNode }) {
  return <div className="panel-shell"><a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="panel-sidebar"><Link className="wordmark" href="/" aria-label="Dalka Jobs public website"><span className="brand-mark" aria-hidden="true">D<span /></span><span>DALKA<span className="brand-text">JOBS</span>.</span></Link><p className="panel-sidebar-label eyebrow">Interface foundation</p><Navigation label="Component preview navigation" /><div className="panel-sidebar-note"><p>Layout preview only</p><span>No account, role or administrative access is granted here.</span><Link href="/">← Public website</Link></div></aside>
    <div className="panel-workspace"><header className="panel-header"><div><span className="eyebrow">Dalka Jobs / Design workspace</span><p>Shared frontend foundation</p></div><span className="sample-badge">UI preview · No authentication</span></header>
      <details className="panel-mobile-navigation"><summary>Browse preview sections</summary><Navigation label="Mobile component preview navigation" /><Link href="/" className="panel-public-link">← Public website</Link></details>
      <main id="main-content" className="panel-main" tabIndex={-1}>{children}</main>
    </div>
  </div>;
}
