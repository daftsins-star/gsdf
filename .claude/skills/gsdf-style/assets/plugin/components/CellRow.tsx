// CellRow.tsx — GSDF Style Guide by Daftsins (alive:medium's feature strip under the deck).
// A row of N equal cells, each with a 3-letter code under it — the "what is running"
// strip. Every cell announces itself in the hint slot (its full name + what it does).
//
//   ▬▬▬ ▬▬▬ ▬▬▬ ▬▬▬ ▬▬▬
//   DRF ERS IRN FTG LSS
//
//   on      --ink-raised cell, dim code; `level` 0..1 brightens a bone fill inside it
//           (live activity — a feature working harder glows brighter)
//   lit     accent cell, bone code: selected / the one that is "now"
//   off     --ink-hair cell, code struck through in --ink-rule (disabled, bypassed,
//           not available in this mode — the hint says why)
//   hover   code turns bone
// Give onSelect to make cells clickable (toggle a feature, pick a slot).
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './CellRow.css';

export interface Cell {
  code: string;                 // 2-4 letters, UPPERCASE
  state?: 'on' | 'lit' | 'off';
  level?: number;               // 0..1 live activity (on cells only)
  hint?: Hint;
}

function CellView({ cell, onClick }: { cell: Cell; onClick?: () => void }) {
  const hintProps = useHint(cell.hint);
  const state = cell.state ?? 'on';
  const level = state === 'on' && cell.level !== undefined ? 0.12 + 0.88 * Math.min(1, Math.max(0, cell.level)) : 0;
  const inner = (
    <>
      <i>{level > 0 && <b style={{ opacity: level }} />}</i>
      <span>{cell.code}</span>
    </>
  );
  return onClick
    ? <button type="button" className={`cell cell--${state}`} onClick={onClick} {...hintProps}>{inner}</button>
    : <span className={`cell cell--${state}`} {...hintProps}>{inner}</span>;
}

export default function CellRow({ cells, onSelect, ariaLabel }: {
  cells: Cell[];
  onSelect?: (index: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="cells" role="group" aria-label={ariaLabel} style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
      {cells.map((c, i) => <CellView key={c.code} cell={c} onClick={onSelect ? () => onSelect(i) : undefined} />)}
    </div>
  );
}
