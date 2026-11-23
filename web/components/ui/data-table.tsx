import type { ReactNode } from "react";

export type TableColumn<Row> = { key: string; heading: string; render: (row: Row) => ReactNode; rowHeader?: boolean };

export function DataTable<Row extends { id: string }>({ rows, columns, caption, emptyState }: {
  rows: readonly Row[]; columns: readonly TableColumn<Row>[]; caption: string; emptyState?: ReactNode;
}) {
  return <div className="ui-table-wrap" role="region" aria-label={caption} tabIndex={0}><table className="ui-table"><caption>{caption}</caption>
    <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.heading}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((column) => column.rowHeader ? <th scope="row" key={column.key}>{column.render(row)}</th> : <td key={column.key}>{column.render(row)}</td>)}</tr>) : <tr><td colSpan={columns.length}>{emptyState ?? "No results to display."}</td></tr>}</tbody>
  </table></div>;
}
