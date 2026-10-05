// Segment.tsx — GSDF Style Guide by Daftsins (from alive:drums' choke row / alive:medium's supply row).
// A choice parameter as joined cells, 1px --ink-rule gaps between them.
//   off   --ink-dim text on black, --ink-text on hover
//   on    BONE ground, black text  (a selection among options is bone, not accent:
//         the accent is kept for "on/live" — bypass, armed, the selected tab)
// Options may be text, an icon, or both. Use for 2..8 options; more is a <select>.
// Toggle (below) is the two-state version: one button, pressed = accent.
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import type { PixelIconName } from '../icons/pixel-icons';
import './Segment.css';

export interface SegmentOption { value: number; label?: string; icon?: PixelIconName; title?: string }

export function Segment({ options, value, onChange, ariaLabel }: {
  options: SegmentOption[];
  value: number;
  onChange: (v: number) => void;   // one click = one begin / setParam / end
  ariaLabel: string;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title ?? o.label}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A two-state switch: hairline box; pressed = accent ground, black text/icon. */
export function Toggle({ on, onChange, icon, children, title }: {
  on: boolean;
  onChange: (on: boolean) => void;
  icon?: PixelIconName;
  children?: ReactNode;
  title?: string;
}) {
  return (
    <button type="button" className="btn tgl" aria-pressed={on} title={title} onClick={() => onChange(!on)}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
