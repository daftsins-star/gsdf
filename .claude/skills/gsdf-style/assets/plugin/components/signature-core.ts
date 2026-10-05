// signature-core.ts — GSDF Style Guide by Daftsins. The signature-piece renderer.
// Plain Canvas2D, no WebGL, no React (SignaturePiece.tsx wraps it).
//
// The technique ("crunch"), per frame, all on a SMALL backing buffer:
//   1. SOURCE   draw the source into a buffer of (css size / cell) pixels:
//               an image (cover-fit, breathes with the level), a scope, a spectrum,
//               or a generative shape. The buffer's smallness IS the pixel crunch.
//   2. POSTERIZE luminance -> one of 4 flat inks from the palette (no gradients survive)
//   3. BOIL     displace every pixel by a pre-baked map; 3 maps swap every --boil-ms
//               (140ms ≈ 7fps "squigglevision"). Maps are baked ONCE — never
//               regenerate noise per frame (that maxed the CPU in testing).
//   4. OUTPUT   putImageData to the visible canvas; CSS upscales it with
//               image-rendering: pixelated.
// Only the signature piece crunches. Never run this over text or controls: a
// whole-UI boil/pixelate pass was tried and rejected — it wrecks legibility.

export type SignatureSource =
  | { kind: 'image'; image: CanvasImageSource; width: number; height: number }
  | { kind: 'scope'; getSamples: () => ArrayLike<number> }        // -1..1, any length
  | { kind: 'spectrum'; getBins: () => ArrayLike<number> }        // 0..1 magnitudes, low -> high
  | { kind: 'shape'; seed?: number };                              // built-in generative form

export interface SignatureOptions {
  source: SignatureSource;
  getLevel: () => number;      // 0..1 audio level (smoothed RMS/peak) — drives reactivity
  cell?: number;               // CSS px per crunch pixel: 2 (fine) .. 4 (chunky). Default 3
  ramp?: 'bone' | 'accent';    // 4 inks: bone = black/hair/dim/bone; accent = black/rule/ACCENT/bone
  boil?: number;               // displacement amplitude in crunch pixels, 0 = off. Default 1
  fps?: number;                // source redraw cap. Default 30
}

type RGB = [number, number, number];

function hexToRgb(s: string): RGB {
  const m = s.trim().match(/^#?([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const r = s.match(/\d+(\.\d+)?/g);   // rgb(a) fallback
  return r ? [+r[0], +r[1], +r[2]] : [0, 0, 0];
}

/** The 4 inks, read from tokens.css so the piece follows the plugin's accent. */
export function readRamp(el: Element, which: 'bone' | 'accent'): RGB[] {
  const cs = getComputedStyle(el);
  const v = (n: string) => hexToRgb(cs.getPropertyValue(n));
  const bg = v('--color-bg');
  if (which === 'accent') {
    const acc = v('--color-accent');
    return [bg, v('--ink-rule'), acc, v('--ink-text')];
  }
  return [bg, v('--ink-hair'), v('--ink-dim'), v('--ink-text')];
}

/** Smooth value noise -> an integer displacement map (dx, dy per pixel). */
function bakeBoilMap(w: number, h: number, amp: number, seed: number): Int8Array {
  const g = 6;   // noise lattice spacing in crunch pixels
  const gw = Math.ceil(w / g) + 2, gh = Math.ceil(h / g) + 2;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) * 2 - 1;
  const lat = Array.from({ length: gw * gh * 2 }, rnd);
  const out = new Int8Array(w * h * 2);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = x / g, gy = y / g, ix = gx | 0, iy = gy | 0;
      const fx = smooth(gx - ix), fy = smooth(gy - iy);
      for (let c = 0; c < 2; c++) {
        const at = (X: number, Y: number) => lat[(Y * gw + X) * 2 + c];
        const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * fx;
        const bot = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * fx;
        out[(y * w + x) * 2 + c] = Math.round((top + (bot - top) * fy) * amp);
      }
    }
  }
  return out;
}

export function createSignature(canvas: HTMLCanvasElement, opts: SignatureOptions): () => void {
  const cell = opts.cell ?? 3;
  const amp = opts.boil ?? 1;
  const fps = opts.fps ?? 30;
  const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  const W = Math.max(8, Math.round(cssW / cell)), H = Math.max(8, Math.round(cssH / cell));
  canvas.width = W;
  canvas.height = H;
  canvas.style.imageRendering = 'pixelated';
  const out = canvas.getContext('2d')!;
  const buf = document.createElement('canvas');
  buf.width = W;
  buf.height = H;
  const src = buf.getContext('2d', { willReadFrequently: true })!;
  const ramp = readRamp(canvas, opts.ramp ?? 'bone');
  const boilMs = parseFloat(getComputedStyle(canvas).getPropertyValue('--boil-ms')) || 140;
  const maps = amp > 0 ? [1, 2, 3].map((k) => bakeBoilMap(W, H, amp, k)) : [];
  const frame = out.createImageData(W, H);
  let raf = 0, last = 0, lvl = 0;

  // The buffer is drawn in GREYS only (#000..#fff): they are luminance for the
  // posterize step, not UI colours. Every visible colour comes from the ramp.
  const drawSource = (t: number, level: number) => {
    const s = opts.source;
    src.fillStyle = '#000';
    src.fillRect(0, 0, W, H);
    src.imageSmoothingEnabled = true;
    if (s.kind === 'image') {
      // cover-fit, then breathe: up to +10% zoom and a brightness lift with the level
      const k = Math.max(W / s.width, H / s.height) * (1 + level * 0.1);
      const dw = s.width * k, dh = s.height * k;
      src.filter = `brightness(${(0.85 + level * 0.5).toFixed(2)}) contrast(1.15)`;
      src.drawImage(s.image, (W - dw) / 2, (H - dh) / 2, dw, dh);
      src.filter = 'none';
    } else if (s.kind === 'scope') {
      const d = s.getSamples();
      src.strokeStyle = '#fff';
      src.lineWidth = 1;
      src.beginPath();
      for (let x = 0; x < W; x++) {
        const v = d[Math.floor((x / W) * d.length)] ?? 0;
        const y = H / 2 - v * (H * 0.42);
        x ? src.lineTo(x, y) : src.moveTo(x, y);
      }
      src.stroke();
      src.fillStyle = '#777';                          // a dim centre rule -> --ink-dim
      src.fillRect(0, Math.floor(H / 2), W, 1);
    } else if (s.kind === 'spectrum') {
      const b = s.getBins();
      const bars = Math.floor(W / 3);
      for (let i = 0; i < bars; i++) {
        const v = b[Math.floor(Math.pow(i / bars, 1.6) * b.length)] ?? 0;   // log-ish spread
        const h = Math.round(v * H * 0.9);
        src.fillStyle = '#fff';
        src.fillRect(i * 3, H - h, 2, h);
        src.fillStyle = '#999';                          // a cap one step down
        src.fillRect(i * 3, H - h - 2, 2, 1);
      }
    } else {
      // generative: a soft blob whose outline wobbles and swells with the level,
      // shaded by radial bands so the posterize gives it 3 flat tones
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * (0.28 + level * 0.12);
      const seed = s.seed ?? 1;
      for (let ring = 4; ring >= 1; ring--) {
        src.beginPath();
        for (let a = 0; a <= 64; a++) {
          const th = (a / 64) * Math.PI * 2;
          const wob = Math.sin(th * 3 + t * 0.0011 * seed) * 0.08 + Math.sin(th * 5 - t * 0.0007) * 0.05 * (1 + level * 2);
          const r = R * (ring / 4) * (1 + wob);
          const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r;
          a ? src.lineTo(x, y) : src.moveTo(x, y);
        }
        const g = [0, 230, 150, 90, 40][ring];
        src.fillStyle = `rgb(${g},${g},${g})`;
        src.fill();
      }
    }
  };

  const render = (t: number) => {
    raf = requestAnimationFrame(render);
    if (document.hidden || t - last < 1000 / fps) return;
    last = t;
    lvl += (Math.max(0, Math.min(1, opts.getLevel())) - lvl) * 0.35;   // light smoothing
    drawSource(t, lvl);
    const px = src.getImageData(0, 0, W, H).data;
    const o = frame.data;
    const map = maps.length ? maps[Math.floor(t / boilMs) % maps.length] : null;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let sx = x, sy = y;
        if (map) {
          sx = Math.min(W - 1, Math.max(0, x + map[i * 2]));
          sy = Math.min(H - 1, Math.max(0, y + map[i * 2 + 1]));
        }
        const j = (sy * W + sx) * 4;
        const L = px[j] * 0.299 + px[j + 1] * 0.587 + px[j + 2] * 0.114;
        const ink = ramp[L < 48 ? 0 : L < 110 ? 1 : L < 180 ? 2 : 3];
        const k = i * 4;
        o[k] = ink[0]; o[k + 1] = ink[1]; o[k + 2] = ink[2]; o[k + 3] = 255;
      }
    }
    out.putImageData(frame, 0, 0);
  };
  raf = requestAnimationFrame(render);
  return () => cancelAnimationFrame(raf);
}
