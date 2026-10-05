// Icon.tsx — GSDF Style Guide by Daftsins. Renders a pixel icon from pixel-icons.ts.
// Copy to ui/src/icons/. Size is 10 (1x) or 20 (2x) — never a fractional scale,
// never a size between: the grid must land on whole device pixels.
import { useMemo } from 'react';
import { PIXEL_ICONS, bitmapToPath, type PixelIconName } from './pixel-icons';

export interface IconProps {
  name: PixelIconName;
  size?: 10 | 20;
  className?: string;
  /** Give a label only when the icon stands alone with no visible text and no title on its button. */
  label?: string;
}

export default function Icon({ name, size = 10, className, label }: IconProps) {
  const d = useMemo(() => bitmapToPath(PIXEL_ICONS[name]), [name]);
  return (
    <svg
      className={`px-icon${className ? ' ' + className : ''}`}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path fill="currentColor" d={d} />
    </svg>
  );
}
