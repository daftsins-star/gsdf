// TabBar.tsx — GSDF Style Guide by Daftsins.
// Pages instead of a bigger window. Each tab = pixel icon + short UPPERCASE word.
//   placement 'row'   an 18px row under the masthead, tabs left, hairline under the row
//                     (use for 3..6 tabs — the default)
//   placement 'mast'  15px hairline buttons inside the masthead (use for 2..4 tabs, as
//                     alive:drums' PRESETS / LIBRARY / SPACE / EDIT)
//   selected  accent ground, black icon + text
//   idle      --ink-dim, --ink-text on hover
// Number keys 1..9 switch tabs when the panel has focus (wire in App, optional).
// The selected tab is UI state (persist it in plugin state if users expect it back).
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import type { PixelIconName } from '../icons/pixel-icons';
import './TabBar.css';

export interface Tab { id: string; label: string; icon: PixelIconName }

export default function TabBar({ tabs, current, onSelect, placement = 'row', right }: {
  tabs: Tab[];
  current: string;
  onSelect: (id: string) => void;
  placement?: 'row' | 'mast';
  right?: ReactNode;           // row only: a status/readout at the far end
}) {
  return (
    <nav className={`tabs tabs--${placement}`} role="tablist">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={current === t.id}
          title={`${t.label} (${i + 1})`}
          onClick={() => onSelect(t.id)}
        >
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </button>
      ))}
      {placement === 'row' && <span className="tabs-gap" />}
      {placement === 'row' && right}
    </nav>
  );
}
