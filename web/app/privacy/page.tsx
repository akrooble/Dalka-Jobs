import type { Metadata } from "next";
import { InformationPage } from "../../components/information-page";

export const metadata: Metadata = { title: "Privacy draft — Dalka Jobs preview" };

export default function PrivacyPage() {
  return <InformationPage draft title="Privacy, designed in from the start." intro="This page is a preview of the information the live service will need to explain. It is not the approved privacy policy.">
    <section className="information-callout"><h2>This preview does not accept applications</h2><p>There are no account, contact, application or CV submission forms. Do not enter or send personal information for the fictional listings. Development or hosting request logs may still exist; this page does not make claims about their configuration.</p></section>
    <section><h2>Planned applicant information</h2><p>For full-recruitment jobs, the planned service will explain what profile information, submitted CV and application details are required, who can access them, and how consent is recorded before collection starts.</p></section>
    <section><h2>Planned retention and deletion</h2><p>The product plan distinguishes immediate profile/profile-CV deletion from submitted application records and CV snapshots retained for six months after submission. Backups are planned to expire within 35 days. These are future requirements, not verified live safeguards.</p></section>
    <section><h2>Before public launch</h2><p>The owner still needs to approve the full policy, responsible business/contact details, legal jurisdiction, providers, request-log practices and the procedure for data requests. A final policy will replace this draft before real applicant intake.</p></section>
  </InformationPage>;
}
