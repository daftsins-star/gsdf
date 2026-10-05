/** GSDF Style Guide by Daftsins — buttons. Classes live in components.css. */
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'pill' | 'primary' | 'ghost' | 'danger';
const pill: Record<Variant, string> = { pill: 'gs-btn', primary: 'gs-btn is-primary', ghost: 'gs-btn is-ghost', danger: 'gs-btn is-ghost is-danger' };

export function Button({ variant = 'pill', icon, children, className = '', ...p }: ComponentProps<'button'> & { variant?: Variant; icon?: ReactNode }) {
  return <button type="button" className={`${pill[variant]} ${className}`} {...p}>{icon}{children}</button>;
}

/** Every icon-only button MUST have a label: it becomes the tooltip and the aria-label. */
export function IconButton({ label, pressed, small, children, className = '', ...p }: ComponentProps<'button'> & { label: string; pressed?: boolean; small?: boolean }) {
  return (
    <button type="button" aria-label={label} data-tip={label} aria-pressed={pressed} className={`gs-ib ${small ? 'sm' : ''} ${className}`} {...p}>
      {children}
    </button>
  );
}

export function ToolGroup({ children }: { children: ReactNode }) {
  return <div className="gs-tools" role="toolbar">{children}</div>;
}
