import type { Metadata } from "next";
import { InformationPage } from "../../components/information-page";

export const metadata: Metadata = { title: "Terms draft — Dalka Jobs preview" };

export default function TermsPage() {
  return <InformationPage draft title="Clear expectations. From the first step." intro="These are preview notes for the future terms page, not finalized terms or an agreement to accept.">
    <section className="information-callout"><h2>Fictional listings for design review</h2><p>The sample roles, employers, dates and salaries illustrate the website. They are not real vacancies, offers of employment or invitations to submit an application.</p></section>
    <section><h2>How the planned service will work</h2><p>External application methods will take place with the hiring company. Full-recruitment applications will be managed by Dalka Jobs only under an authorised recruitment arrangement and with the required account and privacy safeguards.</p></section>
    <section><h2>What still needs approval</h2><p>Before launch, the owner will approve the operator’s identity, contact information, applicable jurisdiction, acceptable-use rules, employer responsibilities and the complete terms. This draft does not settle those decisions.</p></section>
  </InformationPage>;
}
