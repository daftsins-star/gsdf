// StatusStrip.tsx — GSDF Style Guide by Daftsins (from alive:drums' status strip).
// OPTIONAL 22px bottom row: global I/O meters and, when the panel has no Screen, the
// one-line hint slot. Typical content, left to right:
//   IN [meter] -12.0  ···  <HintSlot variant="line" idle="…"/>  ···  OUT [meter] -0.3
// alive:medium has none — leave it out unless there are meters or no Screen.
// Small 18px buttons only (.btn.btn--sm / IconButton size="sm").
import type { ReactNode } from 'react';
import './StatusStrip.css';

export default function StatusStrip({ children }: { children: ReactNode }) {
  return <footer className="status">{children}</footer>;
}

/** Flexible gap between groups. */
export const Gap = () => <span className="st-gap" />;
