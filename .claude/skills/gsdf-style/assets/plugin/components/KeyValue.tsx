// KeyValue.tsx — GSDF Style Guide by Daftsins (alive:medium's inspector rows).
// A two-column grid of facts: key dim on the left, value bone on the right.
//
//   TYPE      I FERRIC
//   LENGTH    C180
//   WARMTH    ■ ■ ■ ■ ■        (a value may be any node: Pips, a Segment, a button)
//
// Rows are 12px type with a 12px row gap — airy on purpose; this is where the panel
// breathes. `empty` greys every value to --ink-rule (nothing loaded).
import type { ReactNode } from 'react';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './KeyValue.css';

export interface KVRow { k: string; v: ReactNode; hint?: Hint; dim?: boolean }

function Row({ row }: { row: KVRow }) {
  const hintProps = useHint(row.hint);
  return (
    <div className={`kv-row${row.dim ? ' kv-row--dim' : ''}`} {...hintProps}>
      <span className="kv-k">{row.k}</span>
      <span className="kv-v">{row.v}</span>
    </div>
  );
}

export default function KeyValue({ rows, keyWidth, empty }: { rows: KVRow[]; keyWidth?: number; empty?: boolean }) {
  return (
    <div className={`kv${empty ? ' is-empty' : ''}`} style={keyWidth ? { gridTemplateColumns: `${keyWidth}px minmax(0, 1fr)` } : undefined}>
      {rows.map((r) => <Row key={r.k} row={r} />)}
    </div>
  );
}
