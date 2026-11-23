"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

export function Dialog({ open, onClose, onClosed, title, description, children }: {
  open: boolean; onClose: () => void; onClosed?: () => void; title: string; description?: string; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return <dialog ref={dialog} className="ui-dialog" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} onClose={onClosed} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="ui-dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="ui-dismiss">×</button></div>
    {description && <p id={descriptionId} className="ui-dialog-description">{description}</p>}
    <div className="ui-dialog-body">{children}</div><div className="ui-dialog-actions"><Button variant="secondary" onClick={onClose}>Close</Button></div>
  </dialog>;
}
