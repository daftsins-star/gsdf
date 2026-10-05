// BarSlider.tsx — GSDF Style Guide by Daftsins (alive:drums' and alive:medium's bar).
// THE continuous control. One row:
//
//   LABEL   [■■■■■■■■■■■············]   +3.0DB
//
//   label   dim, a fixed column so a stack of bars lines up (--bar-lbl)
//   bar     --bar-h tall, --ink-hair well, solid bone fill from the left —
//           bipolar: from a 1px --ink-dim centre hairline that pokes 2px out of the bar
//   value   bone, right-aligned in a fixed column (--bar-val), unit glued on: 0.0DB, 35%
//   hover   label turns bone; the hint slot shows "LABEL · VALUE  what it does"
//   drag    fill turns accent ("now"); the hint stays up with the live value
//
// Press jumps to the pointer; Shift-press drags relatively at x0.1; double-click resets;
// the wheel moves one step per notch (pass `steps` for a stepped parameter).
// Stack bars in a .stack (6px gap). Set --bar-lbl / --bar-val on the stack to fit
// the longest label and value in that group.
import type { ReactNode } from 'react';
import { useParamDrag } from './useParamDrag';
import type { ParamDragOptions } from './useParamDrag';
import { useHint } from './hint-core';
import './BarSlider.css';

export interface BarSliderProps extends Omit<ParamDragOptions, 'axis' | 'value' | 'jumpToPointer' | 'travel'> {
  value: number;                    // normalised 0..1
  label: string;
  format: (v: number) => string;    // normalised -> display text with unit, e.g. "+3.0DB"
  bipolar?: boolean;
  hint?: string;                    // one plain sentence: what it does to the sound
  icon?: ReactNode;                 // rare: a pixel icon before the label
}

export default function BarSlider({ value, label, format, bipolar, hint, icon, ...drag }: BarSliderProps) {
  const { value: v, dragging, handlers } = useParamDrag({ ...drag, value, axis: 'x', jumpToPointer: true });
  const shown = format(v);
  const hintProps = useHint({ title: label, value: shown, text: hint });
  const z = bipolar ? 0.5 : 0;
  return (
    <div className={`bar-row${dragging ? ' is-dragging' : ''}${drag.disabled ? ' is-disabled' : ''}`} {...hintProps}>
      <span className="bar-lbl">{icon}{label}</span>
      <div
        className="bar"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        aria-valuetext={shown}
        aria-disabled={drag.disabled || undefined}
        {...handlers}
      >
        <i className="bar-fill" style={{ left: `${Math.min(v, z) * 100}%`, width: `${Math.abs(v - z) * 100}%` }} />
        {bipolar && <i className="bar-zero" style={{ left: `${z * 100}%` }} />}
      </div>
      <span className="bar-val">{shown}</span>
    </div>
  );
}
