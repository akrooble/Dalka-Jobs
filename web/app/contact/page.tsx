import type { Metadata } from "next";
import { InformationPage } from "../../components/information-page";
import { PublicCopy } from "../../components/frontend/public-copy";

export const metadata: Metadata = { title: "Contact — Dalka Jobs preview" };

export default function ContactPage() {
  return <InformationPage active="contact" title="Let’s build better connections." intro="The live website will provide a clear way for job seekers and employers to reach the Dalka Jobs team.">
    <section className="information-callout"><h2>Contact details are not published yet</h2><p>The owner’s support email, phone number and business contact details will be added before launch. This preview does not include a contact form or collect messages.</p></section>
    <PublicCopy section="contact" />
    <section><h2>For job seekers</h2><p>All vacancies in this preview are fictional. Please do not send CVs, identity documents or personal information in response to these examples.</p></section>
    <section><h2>For employers</h2><p>The planned service supports job advertising and full recruitment managed by the Dalka Jobs team. Employer enquiries and advertising arrangements will be handled through the owner’s published business contact.</p></section>
  </InformationPage>;
}
