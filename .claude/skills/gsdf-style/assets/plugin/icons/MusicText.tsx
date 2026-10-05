// MusicText.tsx — chord names, numerals and key letters with real accidentals.
// Neither guide face (Silkscreen, Space Mono) has ♭ ♮ ♯, and a missing glyph falls back
// to a system font. So each accidental is drawn as a 1-bit pixel glyph in the icon style
// (one cell = `cell` CSS px, fill currentColor) and everything else stays text.
// Case is kept as given: in a chord name m/M and in a numeral i/I carry meaning.
import { Fragment, useMemo } from 'react';
import { bitmapToPath } from './pixel-icons';

const GLYPHS: Record<string, readonly string[]> = {
  '♭': [
    '#...',
    '#...',
    '#...',
    '###.',
    '#..#',
    '#.#.',
    '##..',
  ],
  '♯': [
    '.#.#.',
    '#####',
    '.#.#.',
    '.#.#.',
    '#####',
    '.#.#.',
    '.#.#.',
  ],
  '♮': [
    '#...',
    '#...',
    '####',
    '#..#',
    '#..#',
    '####',
    '...#',
  ],
};

function Accidental({ ch, cell }: { ch: string; cell: number }) {
  const rows = GLYPHS[ch];
  const d = useMemo(() => bitmapToPath(rows), [rows]);
  const w = rows[0].length, h = rows.length;
  return (
    <svg
      className="acc"
      width={w * cell}
      height={h * cell}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" d={d} />
    </svg>
  );
}

/** `cell` = CSS px per glyph cell: 1 beside 8–13px text, 2 beside 18–26px text. */
export default function MusicText({ text, cell = 1 }: { text: string; cell?: 1 | 2 }) {
  const parts = text.split(/([♭♮♯])/u).filter(Boolean);
  return (
    <span className="music" aria-label={text}>
      {parts.map((p, i) =>
        GLYPHS[p] ? <Accidental key={i} ch={p} cell={cell} /> : <Fragment key={i}>{p}</Fragment>,
      )}
    </span>
  );
}
