// PresetMenu.tsx — GSDF Style Guide by Daftsins (the UI half of alive:drums' / alive:medium's
// presets). It drops from the masthead's PRESETS ▾ button (always the first item after
// the brand block) and is bridge-agnostic: the plugin passes the list and the actions.
//
//   ┌ ◀ ▶  WARM BUS ▪ ─────────── ✕ ┐   prev / next, the current name, ▪ = edited since load
//   │ FACTORY                        │
//   │   INIT                         │
//   │ ▌ WARM BUS                     │   current: raised ground, name in the accent
//   │ USER                           │
//   │   MY VOCAL           [✎] [🗑]  │   rename / delete on user presets (hover row)
//   ├────────────────────────────────┤
//   │ [ name…               ][SAVE]  │   save as: a 28px field + one accent button
//   └────────────────────────────────┘
//
// Delete asks once inline (the row turns into "DELETE MY VOCAL?  [NO] [YES]"). Saving over
// an existing user preset asks the same way. Escape closes; a click outside closes.
// Render it INSIDE .app-canvas (it positions under the masthead, top-left).
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Icon from '../icons/Icon';
import { useHint } from './hint-core';
import './PresetMenu.css';

export interface PresetEntry { name: string; factory: boolean }

export interface PresetMenuProps {
  presets: PresetEntry[];
  current: string;              // '' = none loaded
  dirty?: boolean;              // edited since it was loaded
  onLoad: (name: string, factory: boolean) => void;
  onSave: (name: string) => void;          // save (as) a user preset; overwrites after confirm
  onRename?: (from: string, to: string) => void;
  onDelete?: (name: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  error?: string;               // the last action's failure, shown under the save row
}

const clean = (s: string) => s.replace(/[\\/:*?"<>|]/g, '').trim().toUpperCase().slice(0, 32);

function Row({ p, current, dirty, onLoad, onRename, onDelete }: {
  p: PresetEntry; current: boolean; dirty?: boolean;
  onLoad: () => void; onRename?: (to: string) => void; onDelete?: () => void;
}) {
  const [mode, setMode] = useState<'idle' | 'rename' | 'delete'>('idle');
  const [text, setText] = useState(p.name);
  const hintProps = useHint({
    title: p.name,
    value: p.factory ? 'FACTORY' : 'USER',
    text: current ? (dirty ? 'Loaded, and edited since. Click to reload it.' : 'The preset that is loaded now.') : 'Click to load it.',
  });
  if (mode === 'delete') {
    return (
      <div className="pm-row pm-row--ask">
        <span className="pm-name">DELETE {p.name}?</span>
        <button type="button" className="btn btn--sm" onClick={() => setMode('idle')}>NO</button>
        <button type="button" className="btn btn--sm on" onClick={() => { setMode('idle'); onDelete?.(); }}>YES</button>
      </div>
    );
  }
  if (mode === 'rename') {
    const submit = (e: FormEvent) => {
      e.preventDefault();
      const to = clean(text);
      if (to && to !== p.name) onRename?.(to);
      setMode('idle');
    };
    return (
      <form className="pm-row pm-row--ask" onSubmit={submit}>
        <input className="pm-field" value={text} autoFocus maxLength={32} spellCheck={false}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setMode('idle'); } }} />
        <button type="submit" className="btn btn--sm on">OK</button>
      </form>
    );
  }
  return (
    <div className={`pm-row${current ? ' is-current' : ''}`} {...hintProps}>
      <button type="button" className="pm-load" onClick={onLoad}>
        <span className="pm-tag" />
        <span className="pm-name">{p.name}</span>
        {current && dirty && <i className="pm-dirty" aria-label="edited" />}
      </button>
      {!p.factory && onRename && (
        <button type="button" className="pm-act" title={`Rename ${p.name}`} onClick={() => { setText(p.name); setMode('rename'); }}>
          <Icon name="edit" />
        </button>
      )}
      {!p.factory && onDelete && (
        <button type="button" className="pm-act" title={`Delete ${p.name}`} onClick={() => setMode('delete')}>
          <Icon name="trash" />
        </button>
      )}
    </div>
  );
}

export default function PresetMenu({ presets, current, dirty, onLoad, onSave, onRename, onDelete, onPrev, onNext, onClose, error }: PresetMenuProps) {
  const box = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (box.current?.contains(t as Node) || t?.closest?.('.mh-preset')) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('pointerdown', down);
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('keydown', key); };
  }, [onClose]);

  const factory = presets.filter((p) => p.factory);
  const user = presets.filter((p) => !p.factory);
  const save = (e: FormEvent) => {
    e.preventDefault();
    const n = clean(name);
    if (!n) return;
    if (factory.some((p) => p.name === n)) { setConfirm(null); setName(`${n} 2`); return; }
    if (user.some((p) => p.name === n) && confirm !== n) { setConfirm(n); return; }
    onSave(n);
    setConfirm(null);
    setName('');
  };
  const row = (p: PresetEntry) => (
    <Row key={`${p.factory ? 'f' : 'u'}:${p.name}`} p={p} current={p.name === current} dirty={dirty}
      onLoad={() => onLoad(p.name, p.factory)}
      onRename={onRename ? (to) => onRename(p.name, to) : undefined}
      onDelete={onDelete ? () => onDelete(p.name) : undefined} />
  );

  return (
    <div className="pm" ref={box} role="dialog" aria-label="Presets">
      <div className="pm-hd">
        {onPrev && <button type="button" className="pm-act" title="Previous preset" onClick={onPrev}><Icon name="left" /></button>}
        {onNext && <button type="button" className="pm-act" title="Next preset" onClick={onNext}><Icon name="right" /></button>}
        <span className="pm-cur">{current || 'NO PRESET'}</span>
        {dirty && current && <i className="pm-dirty" aria-label="edited" />}
        <span className="pm-gap" />
        <button type="button" className="pm-act" title="Close" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="pm-list">
        {factory.length > 0 && <div className="pm-sec">FACTORY</div>}
        {factory.map(row)}
        <div className="pm-sec">USER</div>
        {user.length > 0 ? user.map(row) : <div className="pm-empty">NOTHING SAVED YET</div>}
      </div>
      <form className="pm-save" onSubmit={save}>
        <input className="pm-field" placeholder="SAVE AS…" value={name} maxLength={32} spellCheck={false}
          onChange={(e) => { setName(e.target.value); setConfirm(null); }} />
        <button type="submit" className={`btn btn--sm${confirm ? ' on' : ''}`} disabled={!clean(name)}>
          {confirm ? 'OVERWRITE' : 'SAVE'}
        </button>
      </form>
      {error && <div className="pm-err" role="status">{error}</div>}
    </div>
  );
}
