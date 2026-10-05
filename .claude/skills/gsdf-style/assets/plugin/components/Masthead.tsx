// Masthead.tsx — GSDF Style Guide by Daftsins (alive:drums' masthead).
// The 28px top row, left to right:
//
//   [ALIVE:DRUMS] [PRESETS ▾] [LIBRARY] [SPACE] [EDIT] ·········· {right} v1.0.0 [≡]
//
//   brand block   solid accent ground, FLUSH with the panel's top-left corner: it runs
//                 to the very top and left edge and fills the masthead's full height —
//                 never an inset chip with space around it. The product name in black
//                 Space Mono ("MAKER:PRODUCT" or "PRODUCT"); the panel's ONE big accent ground
//   header btns   outlined 20px rectangles (1px --ink-rule, bone text), spaced-out
//                 uppercase mono (--track-caps), a 6px gap between each.
//                 PRESETS ▾ first (current preset name, ellipsised; an accent mark when
//                 edited since load; opens PresetMenu.tsx), then the surface /
//                 mode buttons (`buttons`). pressed = accent ground, black text.
//   right         seed, utilities (bare IconButtons), anything global
//   version       dim, lowercase v; menu = hamburger opening a hairline list
//                 (`menuTop` = an optional settings block above the items)
// Every header button may carry a hint (what that surface is) for the hint slot.
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './Masthead.css';

export interface MenuItem { label: string; onClick: () => void; destructive?: boolean }
export interface MastButton { id: string; label: string; pressed?: boolean; onClick: () => void; hint?: Hint }

function HeadButton({ b }: { b: MastButton }) {
  const hintProps = useHint(b.hint);
  return (
    <button type="button" className="mh-btn" aria-pressed={b.pressed} onClick={b.onClick} {...hintProps}>
      <span>{b.label}</span>
    </button>
  );
}

export default function Masthead({ product, mark, presetName, presetDirty, presetsOpen, onPresets, buttons, children, right, version, menu, menuTop }: {
  product: string;                 // e.g. "ALIVE:DRUMS" — uppercase, a colon joins maker and name
  mark?: ReactNode;                // optional 10px maker mark (svg, fill currentColor)
  presetName?: string;
  presetDirty?: boolean;           // edited since loaded: a small accent mark after the name
  presetsOpen?: boolean;
  onPresets?: () => void;
  buttons?: MastButton[];          // LIBRARY, SPACE, EDIT … surfaces and modes
  children?: ReactNode;
  right?: ReactNode;               // seed, utilities (A/B, undo, bypass …) as bare IconButtons
  version?: string;                // "v1.0.0" — dim, lowercase v
  menu?: MenuItem[];
  menuTop?: ReactNode;             // optional settings block above the menu items
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
        <button type="button" className="mh-btn mh-preset" aria-pressed={presetsOpen} title={presetName || 'Presets'} onClick={onPresets}>
          <span className="mh-preset-name">{presetName || 'PRESETS'}</span>
          {presetDirty && presetName && <i className="mh-dirty" aria-label="edited" />}
          <Icon name="caretDown" />
        </button>
      )}
      {buttons?.map((b) => <HeadButton key={b.id} b={b} />)}
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
              {menuTop && <div className="mh-menu-top">{menuTop}</div>}
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
