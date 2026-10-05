// Hint.tsx — GSDF Style Guide by Daftsins (from alive:medium's deck caption).
// HintProvider holds the one current hint; HintSlot draws it. See hint-core.ts for
// the rule and the useHint() hook every control uses.
//
//   <HintSlot />               overlay: pinned to the bottom of its positioned parent
//                              (the Screen), a hairline above it, black ground, up to
//                              four lines. Nothing at all when no control is hovered.
//   <HintSlot variant="line" idle="…" />
//                              one line, for a status strip when the plugin has no Screen.
//   <HintBars bars={[…]} />    a ready-made preview: what a choice would set, as a row
//                              of short bars with codes (alive:medium's tape profile).
//
// Title in the accent (the one place accent is text: the name of what you are aiming
// at), then the sentence in bone, then the optional preview.
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { HintApiContext, HintValueContext, useCurrentHint } from './hint-core';
import type { Hint, HintApi } from './hint-core';
import './Hint.css';

export function HintProvider({ children }: { children: ReactNode }) {
  const [hint, setHint] = useState<Hint | null>(null);
  const owner = useRef<object | null>(null);
  const api = useMemo<HintApi>(() => ({
    show: (h, o) => { owner.current = o; setHint(h); },
    clear: (o) => { if (owner.current === o) { owner.current = null; setHint(null); } },
    owns: (o) => owner.current === o,
  }), []);
  return (
    <HintApiContext.Provider value={api}>
      <HintValueContext.Provider value={hint}>{children}</HintValueContext.Provider>
    </HintApiContext.Provider>
  );
}

export function HintSlot({ variant = 'overlay', idle }: { variant?: 'overlay' | 'line'; idle?: ReactNode }) {
  const h = useCurrentHint();
  if (!h) return idle && variant === 'line' ? <span className="hint-line hint-line--idle">{idle}</span> : null;
  const title = h.value ? `${h.title} · ${h.value}` : h.title;
  if (variant === 'line') {
    return (
      <span className="hint-line" aria-live="polite">
        <span className="hint-title">{title}</span> {h.text}
      </span>
    );
  }
  return (
    <div className="hint-over" aria-live="polite">
      <p><span className="hint-title">{title}</span> {h.text}</p>
      {h.preview && <div className="hint-preview">{h.preview}</div>}
    </div>
  );
}

/** A hint preview: one short bar per feature, its height = what this choice would set. */
export function HintBars({ bars }: { bars: { code: string; v: number }[] }) {
  return (
    <div className="hint-bars" style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}>
      {bars.map((b) => (
        <span key={b.code} className="hint-bar">
          <i><b style={{ height: `${Math.max(6, Math.round(Math.min(1, Math.max(0, b.v)) * 100))}%` }} /></i>
          <span>{b.code}</span>
        </span>
      ))}
    </div>
  );
}
