/**
 * GSDF Style Guide by Daftsins — switch, slider row, number box, search, section label, list row.
 * Radix (npm i radix-ui) gives keyboard + a11y; the look is entirely components.css.
 */
import { useRef, useState, type ReactNode } from 'react';
import { Slider as S, Switch as Sw } from 'radix-ui';

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  // Radix renders aria-checked; .gs-switch draws the thumb with ::after.
  return <Sw.Root className="gs-switch" checked={checked} onCheckedChange={onChange} aria-label={label} />;
}

/** label 84 | 2px track + 12px knob | 52px mono number. Commits once per release. Double-click resets. */
export function SliderRow({ label, value, min, max, step = 1, format = String, onCommit, resetTo }: {
  label: string; value: number; min: number; max: number; step?: number; format?: (v: number) => string; onCommit: (v: number) => void; resetTo?: number;
}) {
  const [live, setLive] = useState<number | null>(null);
  const v = live ?? value;
  return (
    <div className="gs-slider-row" onDoubleClick={() => resetTo !== undefined && onCommit(resetTo)}>
      <label>{label}</label>
      <S.Root className="gs-slider" value={[v]} min={min} max={max} step={step}
        onValueChange={([n]) => setLive(n ?? null)} onValueCommit={([n]) => { setLive(null); if (n !== undefined) onCommit(n); }}>
        <S.Track className="track"><S.Range className="fill" /></S.Track>
        <S.Thumb className="knob is-radix" aria-label={label} />
      </S.Root>
      <NumberBox value={v} format={format} step={step} min={min} max={max} onCommit={onCommit} />
    </div>
  );
}

/** Drag horizontally to scrub, click to type, Enter commits, Escape cancels. */
export function NumberBox({ value, format = String, step = 1, min = -Infinity, max = Infinity, onCommit }: {
  value: number; format?: (v: number) => string; step?: number; min?: number; max?: number; onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const start = useRef<{ x: number; v: number; moved: boolean } | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  if (draft !== null) {
    return <input className="gs-num" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { const n = Number(draft); setDraft(null); if (Number.isFinite(n)) onCommit(clamp(n)); }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setDraft(null); }} />;
  }
  return (
    <span role="spinbutton" aria-valuenow={value} className="gs-num"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: e.clientX, v: value, moved: false }; }}
      onPointerMove={(e) => { const s = start.current; if (!s) return; const dx = e.clientX - s.x; if (Math.abs(dx) > 2) s.moved = true; if (s.moved) onCommit(clamp(s.v + Math.round(dx / 3) * step)); }}
      onPointerUp={() => { const s = start.current; start.current = null; if (s && !s.moved) setDraft(String(value)); }}>
      {format(value)}
    </span>
  );
}

export function Search({ value, onChange, placeholder, shortcut = '⌘F', icon }: { value: string; onChange: (v: string) => void; placeholder: string; shortcut?: string; icon: ReactNode }) {
  return (
    <label className="gs-search">
      {icon}
      <input type="search" spellCheck={false} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') onChange(''); }} />
      <kbd className="gs-kbd">{shortcut}</kbd>
    </label>
  );
}

export function Section({ children, count }: { children: ReactNode; count?: number }) {
  return <div className="gs-section">{children}{count !== undefined && <span className="count">{count}</span>}</div>;
}

export function Row({ icon, name, hint, selected, onOpen }: { icon: ReactNode; name: string; hint?: string; selected?: boolean; onOpen?: () => void }) {
  return (
    <div role="option" tabIndex={0} aria-selected={selected} className="gs-row" onDoubleClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen?.()}>
      <span className="gs-tile-ic">{icon}</span>
      <span className="name">{name}</span>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
