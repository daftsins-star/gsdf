// IconButton.tsx — GSDF Style Guide by Daftsins.
// A square hairline button holding one pixel icon, optionally followed by a label.
//   size 'sm' = 15px box (masthead, status strip)   'md' = 18px box (body)
//   pressed  -> accent ground, black icon (a toggle: bypass, lock, link, A/B)
//   bare     -> no box; the icon alone in --ink-dim, --ink-text on hover (masthead utilities)
// Every icon-only button carries `title` — that is its label and its tooltip.
import type { ReactNode } from 'react';
import Icon from '../icons/Icon';
import type { PixelIconName } from '../icons/pixel-icons';
import './IconButton.css';

export interface IconButtonProps {
  icon: PixelIconName;
  title: string;
  onClick?: () => void;
  pressed?: boolean;          // omit for a plain action button
  size?: 'sm' | 'md';
  bare?: boolean;
  disabled?: boolean;
  children?: ReactNode;       // optional visible label after the icon
}

export default function IconButton({ icon, title, onClick, pressed, size = 'md', bare, disabled, children }: IconButtonProps) {
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
    >
      <Icon name={icon} />
      {children && <span className="ib-text">{children}</span>}
    </button>
  );
}
