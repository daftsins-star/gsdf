// PluginCanvas.tsx — GSDF Style Guide by Daftsins (from alive:drums' App.tsx).
// The panel is DESIGNED at 620x410 and SCALED AS ONE PIECE to the editor window:
// nothing inside reflows, and nothing inside uses vw/vh (they double-count under
// the transform). Scale = 1 at 620x410; it is floored to 2 decimals because an
// unrounded fractional transform blurs text.
// Keep CANVAS_W/H in step with the editor's kWidth/kHeight (PluginEditor.h) and
// make the native window aspect-locked, resizable 0.5x .. 2.5x.
//
// Also paints the ground grain: a deterministic 1-bit speckle, --grain-density of
// ground pixels lifted to --grain-ink. Fixed hash, never Math.random: it must not
// shimmer between repaints.
import { useEffect, useRef, useState, type ReactNode } from 'react';

export const CANVAS_W = 620;
export const CANVAS_H = 410;

// eslint-disable-next-line react-refresh/only-export-components
export function useCanvasScale(): number {
  const compute = () => Math.floor(Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H) * 100) / 100;
  const [s, setS] = useState(compute);
  useEffect(() => {
    const on = () => setS(compute());
    window.addEventListener('resize', on);
    on();
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

// eslint-disable-next-line react-refresh/only-export-components
export function paintGrain(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cs = getComputedStyle(canvas);
  const density = parseFloat(cs.getPropertyValue('--grain-density')) || 0.055;
  ctx.fillStyle = cs.getPropertyValue('--grain-ink').trim();
  const cell = Math.max(1, Math.round(dpr));
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      let k = ((x / cell) * 374761393 + (y / cell) * 668265263) | 0;
      k = Math.imul(k ^ (k >> 13), 1274126177);
      k = (k ^ (k >> 16)) >>> 0;
      if ((k % 1000) / 1000 < density) ctx.fillRect(x, y, cell, cell);
    }
  }
}

export default function PluginCanvas({ children, tabs = false }: { children: ReactNode; tabs?: boolean }) {
  const scale = useCanvasScale();
  const grain = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (grain.current) paintGrain(grain.current); }, []);
  return (
    <div className="app-stage">
      <main className={`app-canvas${tabs ? ' app-canvas--tabs' : ''}`} style={{ transform: `scale(${scale})` }}>
        <canvas ref={grain} className="grain" aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}
