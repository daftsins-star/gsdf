// Meter.tsx — GSDF Style Guide by Daftsins.
//
// Meter: a segmented level meter on a Canvas2D. 3px segments, 1px gaps, 9px thick
// (the BarSlider's height, so a meter and a slider line up in one column).
//   unlit      --ink-hair
//   lit        --ink-text
//   peak hold  one --ink-live segment, holds 1s, then falls
//   over 0 dB  the last segment latches --ink-live until clicked
// It polls getLevel() at --meter-hz (30) — never faster — and stops when hidden.
// Canvases carry no text: the dB read-out is an HTML .val beside it.
//
// Readout: LABEL ········ VALUE — the label/value row of a details column.
// BigReadout: one Silkscreen number per screen (text-xl), unit in .lbl after it.
import { useEffect, useRef, type ReactNode } from 'react';
import './Meter.css';

const dbToNorm = (db: number, floor = -60) => (db <= floor ? 0 : db >= 0 ? 1 : 1 - db / floor);

export function Meter({ getLevel, orientation = 'h', length = 120 }: {
  getLevel: () => number;           // current peak in dBFS
  orientation?: 'h' | 'v';
  length?: number;                  // px along the meter
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const over = useRef(false);
  const level = useRef(getLevel);
  // Keep the ref current after each render (not during it — react-hooks/refs).
  useEffect(() => { level.current = getLevel; });

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const cs = getComputedStyle(c);
    const ink = (n: string) => cs.getPropertyValue(n).trim();
    const hz = parseFloat(cs.getPropertyValue('--meter-hz')) || 30;
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const along = length, across = 9;
    const W = orientation === 'h' ? along : across;
    const H = orientation === 'h' ? across : along;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = `${W}px`; c.style.height = `${H}px`;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const segs = Math.floor((along + 1) / 4);
    let peak = 0, peakAt = 0;

    const draw = () => {
      if (document.hidden) return;
      const db = level.current();
      const n = dbToNorm(db);
      const lit = Math.round(n * segs);
      const now = performance.now();
      if (lit >= peak || now - peakAt > 1000) { peak = lit; peakAt = now; }
      if (db > 0) over.current = true;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < segs; i++) {
        let col = i < lit ? ink('--ink-text') : ink('--ink-hair');
        if (i === peak - 1 && peak > 0) col = ink('--ink-live');
        if (i === segs - 1 && over.current) col = ink('--ink-live');
        ctx.fillStyle = col;
        if (orientation === 'h') ctx.fillRect(i * 4, 0, 3, across);
        else ctx.fillRect(0, along - (i + 1) * 4 + 1, across, 3);
      }
    };
    const id = window.setInterval(draw, 1000 / hz);
    return () => window.clearInterval(id);
  }, [orientation, length]);

  return <canvas ref={ref} className="meter" title="Click to clear the over" onClick={() => (over.current = false)} />;
}

export function Readout({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="ro">
      <span className="lbl ro-lbl">{icon}{label}</span>
      <span className="val">{value}</span>
    </div>
  );
}

export function BigReadout({ value, unit }: { value: string; unit?: string }) {
  return (
    <div className="ro-big">
      <span className="ro-big-num">{value}</span>
      {unit && <span className="lbl">{unit}</span>}
    </div>
  );
}
