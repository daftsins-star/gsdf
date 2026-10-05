// Pips.tsx — GSDF Style Guide by Daftsins (alive:medium's WARMTH / MOTION / GRIT marks).
// A step meter: `count` flat blocks in a row, the first `value` lit.
//
//   ■ ■ ■ ■ □      lit = bone, unlit = --ink-raised, 14x10 blocks, 3px apart
//
// Read-only by default (a rating, a level). Give it onChange and it becomes a stepped
// control: press a pip to set it, drag across, one wheel notch = one step,
// double-click = defaultValue. `min` keeps the first pips always lit (a 5-level switch
// whose lowest level is 1 lit pip). While pressed the lit pips turn accent.
// Sit it in a KeyValue row or after a label: `LABEL  ■■■□□  L3`.
import { useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import { useWheelSteps } from './useParamDrag';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './Pips.css';

export interface PipsProps {
  value: number;                 // pips lit, min..count
  count?: number;                // default 5
  min?: number;                  // default 0
  onChange?: (v: number) => void;
  onBegin?: () => void;
  onEnd?: () => void;
  defaultValue?: number;
  label?: string;                // aria label (and hint title when hint given)
  hint?: Hint;
  empty?: boolean;               // nothing loaded: all pips --ink-hair
}

export default function Pips({ value, count = 5, min = 0, onChange, onBegin, onEnd, defaultValue, label, hint, empty }: PipsProps) {
  const [held, setHeld] = useState<number | null>(null);
  const sent = useRef(value);
  const hintProps = useHint(hint);
  const shown = held ?? value;
  const clamp = (v: number) => Math.min(count, Math.max(min, v));
  const wheel = useWheelSteps((dir) => {
    const next = clamp(value + dir);
    if (next !== value && onChange) { onBegin?.(); onChange(next); onEnd?.(); }
  }, !onChange);

  const pipAt = (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return clamp(Math.floor(((e.clientX - r.left) / r.width) * count) + 1);
  };
  const down = (e: RPointerEvent<HTMLElement>) => {
    if (!onChange || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = pipAt(e);
    onBegin?.();
    setHeld(v);
    sent.current = value;
    if (v !== value) { sent.current = v; onChange(v); }
  };
  const move = (e: RPointerEvent<HTMLElement>) => {
    if (held === null || !onChange) return;
    const v = pipAt(e);
    setHeld(v);
    if (v !== sent.current) { sent.current = v; onChange(v); }
  };
  const up = () => {
    if (held === null) return;
    setHeld(null);
    onEnd?.();
  };

  const interactive = !!onChange;
  return (
    <span
      className={`pips${interactive ? ' pips--ctl' : ''}${held !== null ? ' is-held' : ''}${empty ? ' is-empty' : ''}`}
      role={interactive ? 'slider' : 'meter'}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={count}
      aria-valuenow={shown}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onWheel={interactive ? wheel : undefined}
      onDoubleClick={interactive && defaultValue !== undefined ? () => { onBegin?.(); onChange?.(defaultValue); onEnd?.(); } : undefined}
      {...hintProps}
    >
      {Array.from({ length: count }, (_, i) => <i key={i} className={!empty && i < shown ? 'on' : undefined} />)}
    </span>
  );
}
