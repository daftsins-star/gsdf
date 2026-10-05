// Masthead.tsx — GSDF Style Guide by Daftsins (from alive:drums' masthead).
// The 22px top row, left to right:
//   [BRAND:CHIP]  [≡ PRESET NAME ▾]  {children: mast tabs / mode buttons}  ···  {right}  v1.0.0  [menu]
// The brand chip is the plugin's ONE big accent ground: full row height, product
// name in Silkscreen, black on accent, "MAKER:PRODUCT" or just "PRODUCT".
// An optional maker mark (10px, currentColor) sits inside the chip before the name.
// The menu is a hamburger pixel icon opening a hairline list; no shadows, no radius.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '../icons/Icon';
import './Masthead.css';

export interface MenuItem { label: string; onClick: () => void; destructive?: boolean }

export default function Masthead({ product, mark, presetName, presetsOpen, onPresets, children, right, version, menu }: {
  product: string;                 // e.g. "ALIVE:DRUMS" — uppercase, a colon joins maker and name
  mark?: ReactNode;                // optional 10px maker mark (svg, fill currentColor)
  presetName?: string;
  presetsOpen?: boolean;
  onPresets?: () => void;
  children?: ReactNode;
  right?: ReactNode;               // utilities: A/B, undo, bypass … as bare IconButtons
  version?: string;                // "v1.0.0" — nano, lowercase v
  menu?: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <header className="mh">
      <span className="mh-logo">{mark}{product}</span>
      {onPresets && (
        <button type="button" className="mh-preset" aria-pressed={presetsOpen} title={presetName || 'Presets'} onClick={onPresets}>
          <Icon name="list" />
          <span className="mh-preset-name">{presetName || 'PRESETS'}</span>
          <Icon name="caretDown" />
        </button>
      )}
      {children}
      <span className="mh-spacer" />
      {right}
      {version && <span className="mh-version">{version}</span>}
      {menu && (
        <div className="mh-menu-wrap" ref={wrap}>
          <button type="button" className="mh-menu" title="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name="menu" />
          </button>
          {open && (
            <div className="mh-menu-list" role="menu">
              {menu.map((m) => (
                <button key={m.label} type="button" role="menuitem"
                  className={`mh-menu-item${m.destructive ? ' mh-menu-item--destructive' : ''}`}
                  onClick={() => { setOpen(false); m.onClick(); }}>
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
