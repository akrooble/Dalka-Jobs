import type { ValidationIssue } from "./ui.ts";

// Validation for the component example only; not a product/API validation rule.
export function validateExample(values: { name: string; type: string }): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (values.name.trim().length < 2) issues.push({ fieldId: "example-name", label: "Example name", message: "Enter at least two characters." });
  if (!["sample-a", "sample-b"].includes(values.type)) issues.push({ fieldId: "example-type", label: "Example type", message: "Choose one of the example types." });
  return issues;
}
