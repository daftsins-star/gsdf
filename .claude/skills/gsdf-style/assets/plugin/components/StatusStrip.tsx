// StatusStrip.tsx — GSDF Style Guide by Daftsins (from alive:drums' status strip).
// The 22px bottom row: global I/O and state. Typical content, left to right:
//   [icon] IN  [meter] -12.0 dB  ···  hint / message  ···  [icon] OUT [meter] -0.3 dB
// Small 15px hairline buttons only (.btn.btn--sm / IconButton size="sm").
import type { ReactNode } from 'react';
import './StatusStrip.css';

export default function StatusStrip({ children }: { children: ReactNode }) {
  return <footer className="status">{children}</footer>;
}

/** Flexible gap between groups. */
export const Gap = () => <span className="st-gap" />;
