// IconButton.tsx — GSDF Style Guide by Daftsins.
// A filled square button holding one pixel icon, optionally followed by a label
// (alive:medium's gear button).
//   size 'sm' = 18px box (masthead, status strip)   'md' = 24px box (body)
//   rest     --ink-raised ground, bone icon; hover --ink-rule ground
//   pressed  -> accent ground, black icon (a toggle: bypass, lock, link, A/B)
//   bare     -> no ground; the icon alone in --ink-dim, --ink-text on hover (masthead utilities)
// Every icon-only button carries `title` — its label and its tooltip. Pass `hint` to
// say more in the hint slot (the title stays the accessible name).
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import type { PixelIconName } from '../icons/pixel-icons';
import { useHint } from './hint-core';
import type { Hint } from './hint-core';
import './IconButton.css';

export interface IconButtonProps {
  icon: PixelIconName;
  title: string;
  onClick?: () => void;
  pressed?: boolean;          // omit for a plain action button
  size?: 'sm' | 'md';
  bare?: boolean;
  disabled?: boolean;
  hint?: Hint;
  children?: ReactNode;       // optional visible label after the icon
}

export default function IconButton({ icon, title, onClick, pressed, size = 'md', bare, disabled, hint, children }: IconButtonProps) {
  const hintProps = useHint(hint);
  const cls = ['ib', `ib--${size}`, bare ? 'ib--bare' : '', children ? 'ib--label' : ''].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={cls}
      title={title}
      aria-label={children ? undefined : title}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      {...hintProps}
    >
      <Icon name={icon} />
      {children && <span className="ib-text">{children}</span>}
    </button>
  );
}
