import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

type FieldProps = { id: string; label: string; hint?: string; error?: string };

function descriptionIds(id: string, hint?: string, error?: string, existing?: string) {
  return [existing, hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

function FieldFrame({ id, label, hint, error, children }: FieldProps & { children: ReactNode }) {
  return <div className="ui-field"><label htmlFor={id}>{label}</label>{hint && <p id={`${id}-hint`} className="ui-field-hint">{hint}</p>}{children}{error && <p id={`${id}-error`} className="ui-field-error">{error}</p>}</div>;
}

export function TextField({ id, label, hint, error, className = "", "aria-describedby": describedBy, ...props }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  return <FieldFrame {...{ id, label, hint, error }}><input {...props} id={id} className={`ui-control ${className}`} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={descriptionIds(id, hint, error, describedBy)} /></FieldFrame>;
}

export function SelectField({ id, label, hint, error, children, className = "", "aria-describedby": describedBy, ...props }: FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">) {
  return <FieldFrame {...{ id, label, hint, error }}><select {...props} id={id} className={`ui-control ${className}`} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={descriptionIds(id, hint, error, describedBy)}>{children}</select></FieldFrame>;
}

export function TextAreaField({ id, label, hint, error, className = "", "aria-describedby": describedBy, ...props }: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return <FieldFrame {...{ id, label, hint, error }}><textarea {...props} id={id} className={`ui-control ${className}`} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={descriptionIds(id, hint, error, describedBy)} /></FieldFrame>;
}
