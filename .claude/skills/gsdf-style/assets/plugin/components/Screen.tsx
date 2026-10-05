// Screen.tsx — GSDF Style Guide by Daftsins (alive:medium's DECK).
// The panel's hero window: a hairline frame that holds the picture of what the plugin
// is doing (the signature piece, a chord name, a waveform, a cassette) — and the HINT
// SLOT, which slides over its bottom edge whenever a control is hovered.
//
//   ┌──────────────────────────────┐
//   │ VD-00            (accent)    │   caption: the current item's name, then a bone sub-line
//   │ I FERRIC C180                │
//   │          [ picture ]         │
//   ├──────────────────────────────┤
//   │ IN · +3.0DB  How hard you…   │   hint overlay (only while something is hovered)
//   └──────────────────────────────┘
//
// One Screen per panel. Put it in the widest zone; let it take the free height (flex 1).
// Without a Screen, put <HintSlot variant="line"/> in a status strip instead.
import type { ReactNode } from 'react';
import { HintSlot } from './Hint';
import './Screen.css';

export default function Screen({ title, sub, children, hints = true, className }: {
  title?: ReactNode;          // the current item, drawn in the accent
  sub?: ReactNode;            // one bone line under it
  children?: ReactNode;       // the picture, centred
  hints?: boolean;            // host the hint overlay (default yes)
  className?: string;
}) {
  return (
    <div className={`screen${className ? ' ' + className : ''}`}>
      <div className="screen-body">{children}</div>
      {(title || sub) && (
        <div className="screen-cap">
          {title && <span className="screen-title">{title}</span>}
          {sub && <span className="screen-sub">{sub}</span>}
        </div>
      )}
      {hints && <HintSlot />}
    </div>
  );
}
