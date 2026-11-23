import Link from "next/link";

export function SiteFooter({ live = false }: { live?: boolean }) {
  if (live) return <footer className="site-footer"><div className="container footer-main"><p className="footer-wordmark">DALKA<span>JOBS</span>.</p><div className="footer-note"><span className="eyebrow">Local development</span><p>Current published vacancies. On-site applications remain unavailable.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link href="/">Public jobs</Link><Link href="/admin/jobs">Manage jobs</Link><Link href="/admin/companies">Companies</Link><Link href="/admin/sign-in">Team account</Link></nav><a href="#main-content">Back to top ↑</a></div></footer>;
  return (
    <footer className="site-footer" id="about-preview">
      <div className="container footer-main">
        <div>
          <p className="footer-wordmark">DALKA<span>JOBS</span>.</p>
          <p>Connecting people with possibilities across Somalia.</p>
        </div>
        <div className="footer-column"><h2>Applicant links</h2><Link href="/#jobs">Find jobs</Link><Link href="/account/applications">My applications</Link><Link href="/account/profile">Applicant profile</Link><Link href="/account/sign-in">Sign in / account</Link></div>
        <div className="footer-column"><h2>Explore</h2><Link href="/#locations">Jobs by location</Link><Link href="/about">About Dalka Jobs</Link><Link href="/contact">Contact and support</Link><Link href="/admin/sign-in">Team workspace</Link></div>
        <div className="footer-note"><span className="eyebrow">Frontend preview</span><p>Fictional listings and local sample interactions. No real application or email is sent. Changes reset on refresh.</p></div>
      </div>
      <div className="container footer-bottom">
        <span>Dalka Jobs · Website preview</span>
        <nav className="footer-links" aria-label="Footer navigation"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/account">Applicant preview</Link><Link href="/admin">Admin preview</Link><Link href="/privacy">Privacy draft</Link><Link href="/terms">Terms draft</Link></nav>
        <a href="#main-content">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
