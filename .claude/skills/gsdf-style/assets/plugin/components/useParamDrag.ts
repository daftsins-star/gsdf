// useParamDrag.ts — GSDF Style Guide by Daftsins.
// The one drag behaviour every continuous control shares (BarSlider, the opt-in Knob).
// Values are NORMALISED 0..1; the caller maps to/from the parameter range.
//
//   pointerdown   capture, onBegin()            (-> JUCE beginGesture)
//   pointermove   local value moves; onChange(v) at most once per frame (-> setParam)
//   pointerup     onChange(final), onEnd()      (-> endGesture)
//   Shift         fine: x0.1
//   double-click  reset to default as one begin/change/end
//   wheel         one notch = one step, as one begin/change/end (see useWheelSteps)
//
// STEPPED parameters (a choice, an int, a 5-level switch): pass `steps` = the number
// of positions. The value then snaps to k/(steps-1), onChange fires only when the
// step changes, and one wheel notch moves exactly one step.
//
// The control repaints from the LOCAL value while dragging and from the host
// value otherwise, so host automation shows up and a drag never fights it.
// If the bridge floods, pass commitOnly: onChange then fires only on release.
import { useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent, WheelEvent as RWheelEvent } from 'react';

export interface ParamDragOptions {
  value: number;                 // host value, 0..1
  defaultValue?: number;         // double-click target, 0..1
  axis: 'x' | 'y';               // bar = 'x', knob = 'y' (up = more)
  steps?: number;                // stepped parameter: number of positions (>= 2)
  travel?: number;               // px for the full range when dragging relatively (knob)
  jumpToPointer?: boolean;       // bar: pressing the track jumps there
  commitOnly?: boolean;
  disabled?: boolean;
  onBegin?: () => void;
  onChange: (v: number) => void;
  onEnd?: () => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Snap a 0..1 value to `steps` positions (no-op without steps). */
export function snapTo(v: number, steps?: number): number {
  if (!steps || steps < 2) return clamp01(v);
  return Math.round(clamp01(v) * (steps - 1)) / (steps - 1);
}

/** Wheel -> discrete steps, one per notch. A mouse notch is one event, but a trackpad
 *  or a smooth-scrolling mouse sends a burst of small events: the first event of a
 *  burst always steps once, later ones step again only after ~90ms AND enough travel,
 *  so a swipe moves a few steps, not twenty. Returns an onWheel handler. */
export function useWheelSteps(onStep: (dir: 1 | -1, fine: boolean) => void, disabled?: boolean) {
  const w = useRef({ last: -1e9, step: -1e9, acc: 0 });
  return (e: RWheelEvent<HTMLElement>) => {
    if (disabled) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;   // lines -> px
    const dx = e.deltaMode === 1 ? e.deltaX * 33 : e.deltaX;
    const d = Math.abs(dy) >= Math.abs(dx) ? dy : -dx;
    if (d === 0) return;
    const now = performance.now();
    const s = w.current;
    const fresh = now - s.last > 160;
    s.last = now;
    s.acc = fresh ? d : s.acc + d;
    if (fresh || (now - s.step > 90 && Math.abs(s.acc) >= 8)) {
      s.step = now;
      const dir = s.acc < 0 ? 1 : -1;   // wheel up / swipe up = more
      s.acc = 0;
      onStep(dir, e.shiftKey);
    }
  };
}

export function useParamDrag(o: ParamDragOptions) {
  const [local, setLocal] = useState<number | null>(null);
  const drag = useRef<{ id: number; last: number; v: number; sent: number; raf: number } | null>(null);
  const snap = (v: number) => snapTo(v, o.steps);

  const flush = () => {
    const d = drag.current;
    if (!d) return;
    d.raf = 0;
    const out = snap(d.v);
    if (!o.commitOnly && out !== d.sent) { d.sent = out; o.onChange(out); }
  };

  const onPointerDown = (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || o.disabled) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    let v = o.value;
    if (o.jumpToPointer && !e.shiftKey) {
      const r = el.getBoundingClientRect();
      v = clamp01((e.clientX - r.left) / r.width);
    }
    drag.current = { id: e.pointerId, last: o.axis === 'x' ? e.clientX : e.clientY, v, sent: o.value, raf: 0 };
    o.onBegin?.();
    setLocal(v);
    const out = snap(v);
    if (out !== o.value && !o.commitOnly) { drag.current.sent = out; o.onChange(out); }
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
    const out = snap(d.v);
    if (commit && (o.commitOnly || out !== d.sent)) o.onChange(out);
    o.onEnd?.();
    setLocal(null);
  };

  const once = (v: number) => {
    const out = snap(v);
    if (out === o.value) return;
    o.onBegin?.(); o.onChange(out); o.onEnd?.();
  };

  const onWheel = useWheelSteps((dir, fine) => {
    const step = o.steps && o.steps >= 2 ? 1 / (o.steps - 1) : fine ? 0.001 : 0.01;
    once(o.value + dir * step);
  }, o.disabled);

  const shown = local === null ? o.value : snap(local);
  return {
    value: shown,
    dragging: local !== null,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: RPointerEvent<HTMLElement>) => finish(e, true),
      onPointerCancel: (e: RPointerEvent<HTMLElement>) => finish(e, false),
      onDoubleClick: () => { if (!o.disabled) once(o.defaultValue ?? 0); },
      onWheel,
    },
  };
}
