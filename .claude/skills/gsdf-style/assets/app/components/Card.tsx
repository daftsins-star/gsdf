/**
 * GSDF Style Guide by Daftsins — a collapsible glass card (one group of settings in a pane).
 * Header 36px: grip · accent icon badge · title · (hover) reset · enable switch · chevron.
 */
import { useState, type ReactNode } from 'react';
import { Switch } from './Controls.tsx';

export function Card({ title, icon, enabled, onEnabled, onReset, grip, chevron, resetIcon, gripIcon, children, defaultOpen = true }: {
  title: string; icon: ReactNode; enabled?: boolean; onEnabled?: (v: boolean) => void; onReset?: () => void;
  grip?: boolean; chevron: ReactNode; resetIcon?: ReactNode; gripIcon?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const off = enabled === false;
  return (
    <section className={`gs-card ${open ? '' : 'is-collapsed'} ${off ? 'is-off' : ''}`}>
      <div className="gs-card-h">
        {grip ? <span className="grip" title="Drag to reorder">{gripIcon}</span> : <span style={{ width: 20 }} />}
        <button type="button" className="t" style={{ border: 0, background: 'none', padding: 0 }} onClick={() => setOpen(!open)}>
          <span className="ic">{icon}</span>{title}
        </button>
        {onReset && <button type="button" className="gs-ib sm" aria-label={`Reset ${title}`} onClick={onReset}>{resetIcon}</button>}
        {onEnabled && <Switch checked={!off} onChange={onEnabled} label={`Enable ${title}`} />}
        <button type="button" className="gs-ib sm chev" aria-label={open ? 'Collapse' : 'Expand'} onClick={() => setOpen(!open)}>{chevron}</button>
      </div>
      <div className="gs-card-b">{children}</div>
    </section>
  );
}
