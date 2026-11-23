import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPrototypeScreen, prototypeScreens } from "../../../../lib/prototype";
import { PrototypeShell } from "../../../../components/prototype/shell";
import { PrototypeScreenView } from "../../../../components/prototype/screen";

export const dynamicParams = false;
export function generateStaticParams() { return prototypeScreens.map((screen) => ({ area: screen.area, screen: screen.slug })); }
type Props = { params: Promise<{ area: string; screen: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, screen } = await params;
  const definition = findPrototypeScreen(area, screen);
  return { title: `${definition?.title ?? "Unknown prototype"} — Dalka Jobs`, robots: { index: false, follow: false } };
}
export default async function PrototypePage({ params }: Props) {
  const { area, screen } = await params;
  const definition = findPrototypeScreen(area, screen);
  if (!definition) notFound();
  return <PrototypeShell area={definition.area} current={definition.slug}><PrototypeScreenView screen={definition} /></PrototypeShell>;
}
