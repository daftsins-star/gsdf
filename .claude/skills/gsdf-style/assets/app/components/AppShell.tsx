/**
 * GSDF Style Guide by Daftsins — the app frame: one glass sheet, a 46px title bar, panes split by
 * hairlines (no gaps, no radii between panes). Add the class gs-split-r to a pane that has a
 * neighbour on its right. Column widths are the house defaults.
 *
 *   <AppShell title={…} left={…} center={…} right={…} bottom={…} />
 */
import type { ReactNode } from 'react';

export function AppShell({ titlebar, left, center, right, bottom, leftWidth = 272, rightWidth = 316, bottomHeight = 260 }: {
  titlebar: ReactNode; left?: ReactNode; center: ReactNode; right?: ReactNode; bottom?: ReactNode;
  leftWidth?: number; rightWidth?: number; bottomHeight?: number;
}) {
  // Areas: the bottom strip spans left+center; the right column (inspector) runs full height.
  const cols = [left && `${leftWidth}px`, 'minmax(0,1fr)', right && `${rightWidth}px`].filter(Boolean).join(' ');
  const top = [left && 'left', 'center', right && 'right'].filter(Boolean).join(' ');
  const low = [left && 'bottom', 'bottom', right && 'right'].filter(Boolean).join(' ');
  const pane = (area: string, extra = '') => ({ className: `gs-pane ${extra}`, style: { gridArea: area, display: 'flex', flexDirection: 'column' as const } });
  return (
    <>
      <div className="gs-desk" aria-hidden />
      <div className="gs-window">
        {titlebar}
        <div style={{ display: 'grid', flex: 1, minHeight: 0, gridTemplateColumns: cols,
          gridTemplateRows: bottom ? `minmax(0,1fr) ${bottomHeight}px` : 'minmax(0,1fr)',
          gridTemplateAreas: bottom ? `"${top}" "${low}"` : `"${top}"` }}>
          {left && <aside {...pane('left', 'gs-split-r')}>{left}</aside>}
          <main {...pane('center', 'gs-split-r')}>{center}</main>
          {right && <aside {...pane('right')}>{right}</aside>}
          {bottom && <section {...pane('bottom', 'is-deep gs-row-split gs-split-r')}>{bottom}</section>}
        </div>
      </div>
    </>
  );
}

export function TitleBar({ brand, tools, title, meta, dirty, actions }: { brand?: ReactNode; tools?: ReactNode; title: string; meta?: string; dirty?: boolean; actions?: ReactNode }) {
  return (
    <header className="gs-titlebar">
      <div className="lights" aria-hidden />
      {brand}
      {tools}
      <div className="center">
        <i className="gs-dirty" style={{ opacity: dirty ? 1 : 0 }} aria-hidden />
        <b>{title}</b>
        {meta && <span>· {meta}</span>}
      </div>
      <div className="end">{actions}</div>
    </header>
  );
}
