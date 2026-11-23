import type { Metadata } from "next";
import { PanelShell } from "../../components/panel-shell/panel-shell";
import { UiPreview } from "../../components/ui-preview";

export const metadata: Metadata = {
  title: "UI foundation preview — Dalka Jobs",
  description: "Public, unauthenticated preview of shared frontend components. No administration actions or data are connected.",
};

export default function UiPreviewPage() {
  return <PanelShell><UiPreview /></PanelShell>;
}
