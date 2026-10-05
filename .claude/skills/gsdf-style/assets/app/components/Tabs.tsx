/**
 * GSDF Style Guide by Daftsins — tabs. Many features → tabs, never a longer scroll.
 *   Segmented: 2–4 top-level views of a pane (icon + label, sliding thumb).
 *   SubTabs:   small pills for views inside a view.
 *   VTabs:     left rail in a settings-style dialog (5+ sections).
 */
import type { ReactNode } from 'react';

export interface TabItem<T extends string> { id: T; label: string; icon?: ReactNode }

export function Segmented<T extends string>({ items, value, onChange, compact }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; compact?: boolean }) {
  const i = Math.max(0, items.findIndex((t) => t.id === value));
  return (
    <div role="tablist" className={`gs-seg ${compact ? 'is-compact' : ''}`} style={{ ['--i' as string]: i, ['--n' as string]: items.length }}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} onClick={() => onChange(t.id)}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

export function SubTabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="gs-subtabs">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} onClick={() => onChange(t.id)}>{t.icon}{t.label}</button>
      ))}
    </div>
  );
}

export function VTabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <nav role="tablist" aria-orientation="vertical" className="gs-vtabs">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} onClick={() => onChange(t.id)}>{t.icon}{t.label}</button>
      ))}
    </nav>
  );
}
