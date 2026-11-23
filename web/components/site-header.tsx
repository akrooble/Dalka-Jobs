import Link from "next/link";

export function SiteHeader({ active = "jobs", live = false }: { active?: "jobs" | "about" | "contact" | "applications" | "profile" | "none"; live?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="wordmark" aria-label="Dalka Jobs home">
            <span className="brand-mark" aria-hidden="true">D<span /></span>
            <span>DALKA<span className="brand-text">JOBS</span><span className="wordmark-dot">.</span></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/#jobs" className={active === "jobs" ? "nav-current" : undefined} aria-current={active === "jobs" ? "page" : undefined}>Find jobs</Link>
            <Link href="/account/applications" className={active === "applications" ? "nav-current" : undefined} aria-current={active === "applications" ? "page" : undefined}>My applications</Link>
            <Link href="/account/profile" className={active === "profile" ? "nav-current" : undefined} aria-current={active === "profile" ? "page" : undefined}>Profile</Link>
          </nav>
          <div className="header-actions"><Link href="/account/sign-in">Sign in</Link><Link className="header-account" href="/account">Account</Link><Link className="header-team" href="/admin/sign-in">Team workspace ↗</Link></div>
        </div>
      </header>
      <div className="preview-notice">
        <div className="container">{live ? <><strong>Local development.</strong> Browse current published vacancies. Applicant accounts support fictional local testing only; on-site applications are not open.</> : <><strong>Made for a first look.</strong> All jobs are fictional samples. Applications are not open.</>}</div>
      </div>
    </>
  );
}
