// Knob.tsx — GSDF Style Guide by Daftsins.
// The pixel knob: a 270° ring of 2x2 square ticks (no arc stroke, no gradient,
// no pointer cap). Filled ticks = the value; empty ticks = --ink-hair (a faint track).
// The value sits in the middle in Silkscreen; the label sits under it.
//
//   rest      filled ticks --ink-text
//   hover     empty ticks step up to --ink-rule, the label to --ink-text
//   dragging  filled ticks become --ink-live (the accent marks "now")
//   bipolar   fills from the top-centre tick outwards
//
// Sizes: 26 (dense rows), 34 (default), 44 (the one hero knob). Nothing else.
import { useMemo, type ReactNode } from 'react';
import { useParamDrag, type ParamDragOptions } from './useParamDrag';
import './Knob.css';

export interface KnobProps extends Omit<ParamDragOptions, 'axis' | 'value'> {
  value: number;                    // normalised 0..1
  label: string;
  format: (v: number) => string;    // normalised -> display text, e.g. v => `${Math.round(v*100)}`
  size?: 26 | 34 | 44;
  bipolar?: boolean;
  icon?: ReactNode;                 // optional pixel icon before the label
}

const START = 135;   // degrees, screen space (0 = right, y down): bottom-left
const SWEEP = 270;

export default function Knob({ value, label, format, size = 34, bipolar, icon, ...drag }: KnobProps) {
  const { value: v, dragging, handlers } = useParamDrag({ ...drag, value, axis: 'y', travel: 160 });

  const ticks = useMemo(() => {
    const r = size / 2 - 2;
    const n = Math.max(9, Math.round(((SWEEP / 360) * 2 * Math.PI * r) / 3.5));
    return Array.from({ length: n }, (_, i) => {
      const a = ((START + (i * SWEEP) / (n - 1)) * Math.PI) / 180;
      return {
        x: Math.round(size / 2 + r * Math.cos(a) - 1),
        y: Math.round(size / 2 + r * Math.sin(a) - 1),
        t: i / (n - 1),
      };
    });
  }, [size]);

  const lo = bipolar ? Math.min(v, 0.5) : 0;
  const hi = bipolar ? Math.max(v, 0.5) : v;
  const half = 0.5 / (ticks.length - 1);   // a tick is lit when its centre is inside [lo, hi]

  return (
    <div className={`knob knob--${size}${dragging ? ' is-dragging' : ''}`}>
      <div className="knob-dial" style={{ width: size, height: size }} {...handlers}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true">
          {ticks.map((k, i) => (
            <rect
              key={i}
              x={k.x}
              y={k.y}
              width={2}
              height={2}
              className={k.t >= lo - half && k.t <= hi + half ? 'on' : 'off'}
            />
          ))}
        </svg>
        <span className="knob-val">{format(v)}</span>
      </div>
      <span className="knob-lbl">{icon}{label}</span>
    </div>
  );
}
