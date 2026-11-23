import Link from "next/link";

const items = [["home", "/", "⌂", "Home"], ["browse", "/#jobs", "⌕", "Browse"], ["applications", "/account/applications", "▤", "Applied"], ["profile", "/account/profile", "♙", "Profile"]] as const;

export function MobileNavigation({ active }: { active?: string }) {
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{items.map(([key, href, icon, label]) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav>;
}
