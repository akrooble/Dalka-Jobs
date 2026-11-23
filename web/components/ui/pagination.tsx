import { Button } from "./button";

export function Pagination({ page, totalPages, onPageChange, label = "Table pagination" }: {
  page: number; totalPages: number; onPageChange: (page: number) => void; label?: string;
}) {
  return <nav className="ui-pagination" aria-label={label}><Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span role="status" aria-live="polite">Page {page} of {totalPages}</span><Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></nav>;
}
