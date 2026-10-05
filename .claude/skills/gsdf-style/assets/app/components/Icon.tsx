/**
 * GSDF Style Guide by Daftsins — icons are Phosphor (MIT), filled-path glyphs on a 256 grid.
 * Rule: `regular` at rest, `fill` when the control is on/selected, `bold` only at 11–14px on
 * an accent button. Sizes: 16 (toolbar/title bar), 14 (pills, menus, tabs), 13 (list tiles),
 * 12 (card badges), 11 (inline meta). Colour is always currentColor.
 *
 *   npm i @phosphor-icons/react
 * No-React pages: ../icons/phosphor-sprite.svg -> <svg class="gs-i"><use href="#ph-gear-six"/></svg>
 * (ids ph-NAME, ph-fill-NAME, ph-bold-NAME), or @phosphor-icons/web for the full set.
 */
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react';

export function Icon({ as: Glyph, on = false, size = 16, weight, className }: { as: PhosphorIcon; on?: boolean; size?: number; weight?: IconWeight; className?: string }) {
  return <Glyph size={size} weight={weight ?? (on ? 'fill' : 'regular')} className={className} aria-hidden />;
}
