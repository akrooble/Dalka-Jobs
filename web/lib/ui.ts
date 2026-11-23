export type ValidationIssue = { fieldId: string; label: string; message: string };

export function paginate<T>(rows: readonly T[], requestedPage: number, pageSize: number) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError("Page size must be a positive integer.");
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1));
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), page, totalPages, totalRows, from: totalRows ? start + 1 : 0, to: Math.min(start + pageSize, totalRows) };
}
