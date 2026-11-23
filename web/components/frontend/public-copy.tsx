"use client";
import { useDemo } from "./demo-provider";
export function PublicCopy({ section }: { section: "about" | "contact" }) {
  const { state } = useDemo();
  return <section><h2>{section === "about" ? state.settings.siteName : "Sample contact layout"}</h2><p>{section === "about" ? state.settings.about : state.settings.contact}</p>{section === "contact" && <p>This reserved sample address illustrates the contact layout. It cannot receive messages. The owner’s verified business contact is still required before launch.</p>}</section>;
}
