// List.tsx — GSDF Style Guide by Daftsins (alive:medium's TAPES list).
// A scrolling column of selectable rows — presets, models, slots, tapes:
//
//   ▌ MV/2            IV
//   ▌ HX15        ▪   R        ▪ = marker (default / favourite)
//  [▌ VD-00          [I]]      selected: raised ground, name in the accent, code on an accent chip
//
//   tag     a 5x16 block at the left edge: --ink-rule, or a role you pass ('text' | 'dim' | 'live')
//   name    bone, flexes
//   code    a short right-aligned code (sm, dim) — a type, a grade, a number
//   hover   --ink-hair wash; the hint slot shows the row's hint (and its preview)
//   keys    Up / Down move focus between rows; Enter/Space selects (native buttons)
// Right-click a row -> onContext (e.g. "set as default"); never the WebView menu.
import { useRef } from 'react';
import type { KeyboardEvent as RKeyboardEvent, MouseEvent as RMouseEvent } from 'react';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './List.css';

export interface ListItem {
  id: string;
  name: string;
  code?: string;
  tag?: 'rule' | 'dim' | 'text' | 'live';
  marker?: boolean;
  hint?: Hint;
}

function Row({ item, selected, onSelect, onContext }: {
  item: ListItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onContext?: (id: string, e: RMouseEvent) => void;
}) {
  const hintProps = useHint(item.hint);
  return (
    <button
      type="button"
      className={`li${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(item.id)}
      onContextMenu={(e) => { e.preventDefault(); onContext?.(item.id, e); }}
      {...hintProps}
    >
      <span className={`li-tag li-tag--${item.tag ?? 'rule'}`} />
      <span className="li-name">{item.name}</span>
      {item.marker && <i className="li-marker" aria-label="default" />}
      {item.code && <span className="li-code">{item.code}</span>}
    </button>
  );
}

export default function List({ items, selected, onSelect, onContext, ariaLabel }: {
  items: ListItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  onContext?: (id: string, e: RMouseEvent) => void;
  ariaLabel: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const rows = Array.from(box.current?.querySelectorAll<HTMLButtonElement>('.li') ?? []);
    const i = rows.indexOf(document.activeElement as HTMLButtonElement);
    const next = rows[(i + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length];
    next?.focus();
    next?.scrollIntoView({ block: 'nearest' });
    e.preventDefault();
  };
  return (
    <div className="list" role="group" aria-label={ariaLabel} ref={box} onKeyDown={onKey}>
      {items.map((it) => (
        <Row key={it.id} item={it} selected={it.id === selected} onSelect={onSelect} onContext={onContext} />
      ))}
    </div>
  );
}
