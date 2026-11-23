import type { ValidationIssue } from "../../lib/ui";

export function ValidationSummary({ issues, id = "validation-summary" }: { issues: readonly ValidationIssue[]; id?: string }) {
  if (!issues.length) return null;
  return <div className="ui-validation-summary" role="alert" aria-labelledby={`${id}-title`} tabIndex={-1} id={id}>
    <h3 id={`${id}-title`}>Check the following fields</h3><ul>{issues.map((issue) => <li key={issue.fieldId}><a href={`#${issue.fieldId}`}>{issue.label}: {issue.message}</a></li>)}</ul>
  </div>;
}
