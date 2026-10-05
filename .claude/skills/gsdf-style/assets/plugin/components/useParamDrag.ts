// useParamDrag.ts — GSDF Style Guide by Daftsins.
// The one drag behaviour every continuous control shares (Knob, BarSlider).
// Values are NORMALISED 0..1; the caller maps to/from the parameter range.
//
//   pointerdown   capture, onBegin()            (-> JUCE beginGesture)
//   pointermove   local value moves; onChange(v) at most once per frame (-> setParam)
//   pointerup     onChange(final), onEnd()      (-> endGesture)
//   Shift         fine: x0.1
//   double-click  reset to default as one begin/change/end
//   wheel         one step (1/100, Shift 1/1000) as one begin/change/end
//
// The control repaints from the LOCAL value while dragging and from the host
// value otherwise, so host automation shows up and a drag never fights it.
// If the bridge floods, pass commitOnly: onChange then fires only on release.
import { useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent, WheelEvent as RWheelEvent } from 'react';

export interface ParamDragOptions {
  value: number;                 // host value, 0..1
  defaultValue?: number;         // double-click target, 0..1
  axis: 'x' | 'y';               // knob = 'y' (up = more), bar = 'x'
  travel?: number;               // px for the full range when dragging relatively (knob)
  jumpToPointer?: boolean;       // bar: pressing the track jumps there
  commitOnly?: boolean;
  onBegin?: () => void;
  onChange: (v: number) => void;
  onEnd?: () => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function useParamDrag(o: ParamDragOptions) {
  const [local, setLocal] = useState<number | null>(null);
  const drag = useRef<{ id: number; last: number; v: number; raf: number } | null>(null);

  const flush = () => {
    const d = drag.current;
    if (!d) return;
    d.raf = 0;
    if (!o.commitOnly) o.onChange(d.v);
  };

  const onPointerDown = (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    let v = o.value;
    if (o.jumpToPointer && !e.shiftKey) {
      const r = el.getBoundingClientRect();
      v = clamp01((e.clientX - r.left) / r.width);
    }
    drag.current = { id: e.pointerId, last: o.axis === 'x' ? e.clientX : e.clientY, v, raf: 0 };
    o.onBegin?.();
    setLocal(v);
    if (v !== o.value && !o.commitOnly) o.onChange(v);
  };

  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const pos = o.axis === 'x' ? e.clientX : e.clientY;
    const span = o.axis === 'x' ? e.currentTarget.getBoundingClientRect().width : (o.travel ?? 160);
    const delta = (o.axis === 'x' ? pos - d.last : d.last - pos) / span;
    d.last = pos;
    d.v = clamp01(d.v + delta * (e.shiftKey ? 0.1 : 1));
    setLocal(d.v);
    if (!d.raf) d.raf = requestAnimationFrame(flush);
  };

  const finish = (e: RPointerEvent<HTMLElement>, commit: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.raf) cancelAnimationFrame(d.raf);
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (commit) o.onChange(d.v);
    o.onEnd?.();
    setLocal(null);
  };

  const once = (v: number) => { o.onBegin?.(); o.onChange(clamp01(v)); o.onEnd?.(); };

  return {
    value: local ?? o.value,
    dragging: local !== null,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: RPointerEvent<HTMLElement>) => finish(e, true),
      onPointerCancel: (e: RPointerEvent<HTMLElement>) => finish(e, false),
      onDoubleClick: () => once(o.defaultValue ?? 0),
      onWheel: (e: RWheelEvent<HTMLElement>) => once(o.value + Math.sign(-e.deltaY) * (e.shiftKey ? 0.001 : 0.01)),
    },
  };
}
