import type { Metadata } from "next";
import Link from "next/link";
import { InformationPage } from "../../components/information-page";
import { PublicCopy } from "../../components/frontend/public-copy";

export const metadata: Metadata = { title: "About Dalka Jobs — Public preview" };

export default function AboutPage() {
  return <InformationPage active="about" title="Good work starts with a connection." intro="Dalka Jobs is being built to connect people with opportunities across Somalia.">
    <PublicCopy section="about" />
    <section><h2>A clearer way to find work</h2><p>The planned job board will bring together opportunities from private companies, NGOs and government organisations, with clear locations, deadlines and application instructions.</p></section>
    <section><h2>Different jobs. Clear next steps.</h2><p>Some employers will accept applications by email, on their own website or through a published WhatsApp contact. For full-recruitment contracts, the Dalka Jobs team will manage applications and interview stages through protected accounts.</p></section>
    <section className="information-callout"><h2>What you can explore today</h2><p>This is a local design preview: six fictional job listings, detailed example roles and public information pages. No real hiring, account creation or application collection is active.</p><Link href="/#jobs" className="detail-link">Explore the sample jobs ↗</Link></section>
  </InformationPage>;
}
