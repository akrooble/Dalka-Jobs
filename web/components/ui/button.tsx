import type { ButtonHTMLAttributes } from "react";

export function Button({ variant = "primary", loading = false, loadingLabel = "Working…", type = "button", className = "", disabled, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger"; loading?: boolean; loadingLabel?: string;
}) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`button ui-button button-${variant} ${className}`}>
    {loading && <span className="ui-spinner" aria-hidden="true" />}{loading ? loadingLabel : children}
  </button>;
}
