// PluginCanvas.tsx — GSDF Style Guide by Daftsins (from alive:drums' App.tsx).
// The panel is DESIGNED at CANVAS_W x CANVAS_H and SCALED AS ONE PIECE to the editor
// window: nothing inside reflows, and nothing inside uses vw/vh (they double-count
// under the transform). Scale = 1 at the design size; it is floored to 2 decimals
// because an unrounded fractional transform blurs text.
//
// Size: no fixed size — the SMALLEST window that fits the plugin without crowding
// (alive:medium / alive:drums are 620x410; grow only when the content needs it).
// An EXISTING plugin keeps its size. Keep CANVAS_W/H, tokens.css
// --panel-w/h and the editor's base size in step; the native window is aspect-locked
// and resizable (0.5x..2.5x for a new plugin; an existing one keeps its limits).
//
// Also mounts the HintProvider (hint-core.ts). The ground is flat black — no grain,
// noise or specks (an earlier grain layer was removed at the user's request).
//
// Children, top to bottom: <Masthead/> · <TabBar/>? · <div className="body">…</div> · <StatusStrip/>?
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { HintProvider } from './Hint';

export const CANVAS_W = 620;
export const CANVAS_H = 410;

// eslint-disable-next-line react-refresh/only-export-components
export function useCanvasScale(): number {
  const compute = () => Math.floor(Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H) * 100) / 100;
  const [s, setS] = useState(compute);
  useEffect(() => {
    const on = () => setS(compute());
    window.addEventListener('resize', on);
    on();
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

export default function PluginCanvas({ children }: { children: ReactNode }) {
  const scale = useCanvasScale();
  return (
    <div className="app-stage">
      <main className="app-canvas" style={{ transform: `scale(${scale})` }}>
        <HintProvider>{children}</HintProvider>
      </main>
    </div>
  );
}
