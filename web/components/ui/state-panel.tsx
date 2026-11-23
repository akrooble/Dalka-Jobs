import type { ReactNode } from "react";

export function StatePanel({ variant = "empty", title, children, action }: {
  variant?: "empty" | "loading" | "error" | "forbidden"; title: string; children: ReactNode; action?: ReactNode;
}) {
  const symbols = { empty: "○", loading: "◌", error: "!", forbidden: "⊘" };
  return <div className={`ui-state ui-state-${variant}`} aria-busy={variant === "loading" || undefined}>
    <span className="ui-state-symbol" aria-hidden="true">{symbols[variant]}</span><h3>{title}</h3><div className="ui-state-body">{children}</div>{action && <div className="ui-state-action">{action}</div>}
  </div>;
}
