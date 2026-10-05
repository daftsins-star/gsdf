// Segment.tsx — GSDF Style Guide by Daftsins (alive:medium's SUPPLY and TRACK/BUS rows).
// A choice parameter as joined cells, 1px --ink-rule gaps between them:
//
//   SUPPLY [REG|STK|TRD|FAIL]        size="sm", label left (dim)
//          [   TRACK   |    BUS   ]   size="md" (default)
//
//   off     --ink-dim text on black, --ink-text on hover
//   chosen  BONE ground, black text (a choice among siblings is bone; the accent is
//           kept for on/live states)
//   hint    every option announces ITSELF: hovering FAIL shows "SUPPLY · FAILING  A
//           failing supply. Big hits nearly stall the tape…" before the user clicks.
// Options may be text, an icon, or both. 2..8 options; more is a List or a <select>.
// Toggle (below) is the two-state version: one button, pressed = accent.
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import type { PixelIconName } from '../icons/pixel-icons';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './Segment.css';

export interface SegmentOption { value: number; label?: ReactNode; icon?: PixelIconName; title?: string; hint?: Hint; disabled?: boolean }

function Opt({ o, chosen, onChange }: { o: SegmentOption; chosen: boolean; onChange: (v: number) => void }) {
  const hintProps = useHint(o.hint);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={chosen}
      title={o.hint ? undefined : o.title}
      disabled={o.disabled}
      onClick={() => onChange(o.value)}
      {...hintProps}
    >
      {o.icon && <Icon name={o.icon} />}
      {o.label}
    </button>
  );
}

export function Segment({ options, value, onChange, ariaLabel, label, size = 'md', hint }: {
  options: SegmentOption[];
  value: number;
  onChange: (v: number) => void;   // one click = one begin / setParam / end
  ariaLabel: string;
  label?: string;                  // optional dim label to the left
  size?: 'sm' | 'md';
  hint?: Hint;                     // the label's own hint (what the whole choice is)
}) {
  const hintProps = useHint(hint);
  const seg = (
    <div className={`seg seg--${size}`} role="radiogroup" aria-label={ariaLabel} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => <Opt key={o.value} o={o} chosen={value === o.value} onChange={onChange} />)}
    </div>
  );
  if (!label) return seg;
  return (
    <div className="seg-row">
      <span className="lbl seg-lbl" {...hintProps}>{label}</span>
      {seg}
    </div>
  );
}

/** A two-state switch: a filled .btn; pressed = accent ground, black text/icon. */
export function Toggle({ on, onChange, icon, children, title, hint }: {
  on: boolean;
  onChange: (on: boolean) => void;
  icon?: PixelIconName;
  children?: ReactNode;
  title?: string;
  hint?: Hint;
}) {
  const hintProps = useHint(hint);
  return (
    <button type="button" className="btn tgl" aria-pressed={on} title={hint ? undefined : title} onClick={() => onChange(!on)} {...hintProps}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
