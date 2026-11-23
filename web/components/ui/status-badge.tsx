import type { ReactNode } from "react";

export function StatusBadge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info"; children: ReactNode }) {
  return <span className={`ui-badge ui-tone-${tone}`}>{children}</span>;
}
