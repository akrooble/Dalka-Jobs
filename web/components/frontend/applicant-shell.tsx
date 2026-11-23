"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { MobileNavigation } from "../mobile-navigation";
import { useDemo } from "./demo-provider";

export function ApplicantShell({ section, children }: { section: string; children: ReactNode }) {
  const { notice, dismiss, reset } = useDemo();
  const active = section.startsWith("application") ? "applications" : section === "profile" ? "profile" : undefined;
  return <><SiteHeader active={active ?? "none"} /><main id="main-content" tabIndex={-1} className={`applicant-main applicant-${section}`}><div className="container"><nav className="applicant-links" aria-label="Applicant workspace">{[["overview", "/account", "Overview"], ["applications", "/account/applications", "My applications"], ["profile", "/account/profile", "Profile"], ["notifications", "/account/notifications", "Updates"]].map(([key, href, label]) => <Link key={key} href={href} aria-current={section === key ? "page" : undefined}>{label}</Link>)}<button type="button" onClick={reset}>Reset sample data</button></nav>{notice && <div className="desk-toast" role="status"><span>{notice}</span><button type="button" onClick={dismiss} aria-label="Dismiss update">×</button></div>}{children}</div></main><SiteFooter /><MobileNavigation active={active} /></>;
}
