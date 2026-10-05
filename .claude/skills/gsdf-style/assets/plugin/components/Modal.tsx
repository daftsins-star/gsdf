// Modal.tsx — GSDF Style Guide by Daftsins (from alive:drums' sign-out modal).
// SOLID black backdrop over the whole canvas (no veil, no alpha, no blur), a 280px
// box with a 1px bone border, Silkscreen title, Space Mono sub-line, buttons in a row.
// The confirming action is the ONLY accent in the modal. Escape = cancel.
import { useEffect, type ReactNode } from 'react';
import './Modal.css';

export default function Modal({ title, children, confirmLabel = 'OK', cancelLabel = 'CANCEL', onConfirm, onCancel }: {
  title: string;
  children?: ReactNode;      // the sub-line(s)
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-dialog">
        <p className="modal-message">{title}</p>
        {children && <div className="modal-sub">{children}</div>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn on" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
