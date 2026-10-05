// hint-core.ts — GSDF Style Guide by Daftsins (from alive:medium's deck caption).
// The hint system: every control announces itself. Hovering (or focusing) a control
// puts its hint in the panel's one hint slot (<HintSlot/>, Hint.tsx):
//
//   TITLE · VALUE  one plain sentence that says what it does to the sound.
//   [optional preview: what choosing this would give you]
//
// The title is the control's name (plus its live value while you hover or drag it);
// for a choice — a segment cell, a list row — it is the OPTION you are pointing at,
// so the user reads what the option does before clicking it. That is what makes the
// panel feel like it knows what you are aiming at.
//
// While a control holds pointer capture (a drag), it keeps the slot: pointerleave
// does not fire until release, so the hint and its value stay up for the whole drag.
//
// No provider = no hints, no errors: useHint degrades to empty props.
// PluginCanvas mounts the provider, so a plugin gets this for free.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface Hint {
  title: string;           // the control or option name, UPPERCASE — drawn in the accent
  text?: string;           // one or two plain sentences, sentence case is fine (rendered uppercase)
  value?: string;          // live value, appended to the title as "TITLE · VALUE"
  preview?: ReactNode;     // optional: what this choice would give (bars, a small chart)
}

export interface HintApi {
  show: (h: Hint, owner: object) => void;
  clear: (owner: object) => void;
  owns: (owner: object) => boolean;
}

export const HintApiContext = createContext<HintApi | null>(null);
export const HintValueContext = createContext<Hint | null>(null);

export interface HintTargetProps {
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/** Props that make an element announce `h` in the hint slot. Spread them on the
 *  element that should own the hover area (a whole slider row, a segment cell). */
export function useHint(h: Hint | undefined): HintTargetProps {
  const api = useContext(HintApiContext);
  const [owner] = useState(() => ({}));
  const latest = useRef(h);
  useEffect(() => { latest.current = h; });

  // While this control owns the slot, keep its live value and text current.
  const key = h ? `${h.title}\u0000${h.text ?? ''}\u0000${h.value ?? ''}` : '';
  useEffect(() => {
    const cur = latest.current;
    if (api && cur && api.owns(owner)) api.show(cur, owner);
  }, [api, key, owner]);

  // Unmounting while owning the slot must not leave a stale hint behind.
  useEffect(() => () => api?.clear(owner), [api, owner]);

  if (!api || !h) return {};
  const on = () => { if (latest.current) api.show(latest.current, owner); };
  const off = () => api.clear(owner);
  return { onPointerEnter: on, onPointerLeave: off, onFocus: on, onBlur: off };
}

/** The hint currently showing (null when nothing is hovered). For HintSlot. */
export function useCurrentHint(): Hint | null {
  return useContext(HintValueContext);
}
