// BarSlider.tsx — GSDF Style Guide by Daftsins (from alive:drums' BarSlider).
// One row:  LABEL  [■■■■■■■······]  VALUE
//   the bar is 9px tall, --ink-hair well, solid --ink-text fill from the left
//   (or from the zero line when bipolar, with a 1px --ink-dim zero tick)
//   hover: the fill stays, the well steps up to --ink-rule
//   dragging: the fill becomes --ink-live
// Pressing the bar jumps the value to the pointer; Shift-press drags relatively, x0.1.
import type { ReactNode } from 'react';
import { useParamDrag, type ParamDragOptions } from './useParamDrag';
import './BarSlider.css';

export interface BarSliderProps extends Omit<ParamDragOptions, 'axis' | 'value' | 'jumpToPointer'> {
  value: number;                    // normalised 0..1
  label: string;
  format: (v: number) => string;
  bipolar?: boolean;
  icon?: ReactNode;                 // a pixel icon in place of / before the label
}

export default function BarSlider({ value, label, format, bipolar, icon, ...drag }: BarSliderProps) {
  const { value: v, dragging, handlers } = useParamDrag({ ...drag, value, axis: 'x', jumpToPointer: true });
  const z = bipolar ? 0.5 : 0;
  return (
    <div className={`bar-row${dragging ? ' is-dragging' : ''}`}>
      <span className="lbl bar-lbl">{icon}{label}</span>
      <div className="bar" {...handlers}>
        {bipolar && <i className="bar-zero" style={{ left: `${z * 100}%` }} />}
        <i className="bar-fill" style={{ left: `${Math.min(v, z) * 100}%`, width: `${Math.abs(v - z) * 100}%` }} />
      </div>
      <span className="val bar-val">{format(v)}</span>
    </div>
  );
}
