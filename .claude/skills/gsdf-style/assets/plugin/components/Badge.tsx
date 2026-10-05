// Badge.tsx — GSDF Style Guide by Daftsins (alive:medium's LOADED chip).
// A small solid state chip at the right end of a section head:
//   on    accent ground, black text  — LOADED, ARMED, LIVE, SYNCED
//   off   --ink-raised ground, dim text — EMPTY, IDLE
// One word. A badge is a state, never a button.
import type { ReactNode } from 'react';
import './Badge.css';

export default function Badge({ on = true, children }: { on?: boolean; children: ReactNode }) {
  return <span className={`badge${on ? ' badge--on' : ''}`}>{children}</span>;
}
