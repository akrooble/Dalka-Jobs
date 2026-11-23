import type { ReactNode } from "react";

export function Feedback({ title, children, tone = "info", announce = false, onDismiss }: {
  title: string; children?: ReactNode; tone?: "info" | "success" | "warning" | "danger"; announce?: boolean; onDismiss?: () => void;
}) {
  return <div className={`ui-feedback ui-tone-${tone}`} role={announce ? tone === "danger" ? "alert" : "status" : undefined}>
    <div><p className="ui-feedback-title">{title}</p>{children && <div className="ui-feedback-body">{children}</div>}</div>
    {onDismiss && <button type="button" className="ui-dismiss" onClick={onDismiss} aria-label="Dismiss notification">×</button>}
  </div>;
}
