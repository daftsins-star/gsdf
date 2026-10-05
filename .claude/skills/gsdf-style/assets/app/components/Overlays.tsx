/**
 * GSDF Style Guide by Daftsins — menu, tooltip, dialog, toast on Radix (npm i radix-ui).
 * Surfaces: menus/pickers = .gs-popover (near-opaque, 48px blur); tooltips = .gs-raised;
 * dialogs = .gs-raised over a 35% scrim, 18px radius, pinned 64px from the top.
 */
import type { ComponentProps, ReactNode } from 'react';
import { Dialog as D, DropdownMenu as M, Tooltip as T } from 'radix-ui';

export const Menu = M.Root;
export const MenuTrigger = M.Trigger;
export function MenuContent({ className = '', ...p }: ComponentProps<typeof M.Content>) {
  return <M.Portal><M.Content sideOffset={6} className={`gs-popover gs-menu ${className}`} {...p} /></M.Portal>;
}
export function MenuItem({ icon, shortcut, children, ...p }: ComponentProps<typeof M.Item> & { icon?: ReactNode; shortcut?: string }) {
  return <M.Item className="item" {...p}>{icon}{children}{shortcut && <span className="k">{shortcut}</span>}</M.Item>;
}
export const MenuLabel = (p: ComponentProps<typeof M.Label>) => <M.Label className="lbl" {...p} />;
export const MenuRule = () => <M.Separator className="rule" />;

export function Tip({ tip, shortcut, children }: { tip: string; shortcut?: string; children: React.ReactElement }) {
  return (
    <T.Root delayDuration={300}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal><T.Content sideOffset={6} className="gs-raised gs-tip">{tip}{shortcut && <span className="k">{shortcut}</span>}</T.Content></T.Portal>
    </T.Root>
  );
}
export const TipProvider = T.Provider;

export function Dialog({ open, onOpenChange, title, description, children, footer, width = 440 }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; width?: number;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="gs-scrim" />
        <D.Content className="gs-raised gs-dialog" style={{ width }}>
          <D.Title asChild><h2>{title}</h2></D.Title>
          {description && <D.Description className="desc">{description}</D.Description>}
          <div style={{ marginTop: 16 }}>{children}</div>
          {footer && <footer>{footer}</footer>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function Toast({ text }: { text: string | null }) {
  return text === null ? null : <div role="status" className="gs-toast">{text}</div>;
}
