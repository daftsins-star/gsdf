/**
 * GSDF Style Guide by Daftsins — the glass window for an Electron app.
 *
 * macOS: `hud` is the most translucent DARK material (measured against a real screen capture
 * over a colourful and a dark desktop; 'under-window' / 'sidebar' read as opaque grey).
 * `visualEffectState: 'active'` keeps the glass when the window loses focus.
 * The page must be transparent all the way down (html, body, root): see glass.css.
 *
 * Windows 11: acrylic behind a transparent page. Linux / older Windows: no OS material —
 * the renderer falls back to the self-painted desk (no data-glass attribute).
 */
import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';

export const TITLE_BAR_HEIGHT = 46; // matches --h-title; the traffic lights are centred in it

export type GlassMode = 'native' | 'web';

export function glassMode(platform: NodeJS.Platform = process.platform): GlassMode {
  return platform === 'darwin' || platform === 'win32' ? 'native' : 'web';
}

/** Pure, so it can be unit-tested without opening a window. */
export function glassWindowOptions(preload: string, opts: { width?: number; height?: number; minWidth?: number; minHeight?: number } = {}): BrowserWindowConstructorOptions {
  const base: BrowserWindowConstructorOptions = {
    show: false, // show on 'ready-to-show' so the glass never flashes white
    width: opts.width ?? 1280,
    height: opts.height ?? 800,
    minWidth: opts.minWidth ?? 900,
    minHeight: opts.minHeight ?? 600,
    backgroundColor: '#00000000', // fully transparent: the material IS the background
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload },
  };
  if (process.platform === 'darwin') {
    return {
      ...base,
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 17 }, // centred in the 46px title bar
      vibrancy: 'hud',
      visualEffectState: 'active',
    };
  }
  if (process.platform === 'win32') {
    return {
      ...base,
      titleBarStyle: 'hidden',
      titleBarOverlay: { color: '#00000000', symbolColor: '#C5CAD6', height: TITLE_BAR_HEIGHT },
      backgroundMaterial: 'acrylic',
    };
  }
  return { ...base, frame: true }; // Linux: native frame, renderer paints the desk
}

/** Small fixed utility window (launcher, about, picker): same material, not resizable. */
export function glassUtilityOptions(preload: string, width = 560, height = 420): BrowserWindowConstructorOptions {
  return { ...glassWindowOptions(preload, { width, height, minWidth: width, minHeight: height }), resizable: false, maximizable: false, fullscreenable: false, center: true };
}

export function createGlassWindow(preload: string, url: string): BrowserWindow {
  const win = new BrowserWindow(glassWindowOptions(preload));
  // Tell the renderer which glass to draw: <html data-glass="native"> when the OS supplies it.
  const u = new URL(url);
  u.searchParams.set('glass', glassMode());
  void win.loadURL(u.toString());
  win.once('ready-to-show', () => win.show());
  return win;
}

/*
 * Renderer side (first line of your entry, before first paint):
 *
 *   if (new URLSearchParams(location.search).get('glass') === 'native')
 *     document.documentElement.dataset.glass = 'native';
 *
 * Title bar: give it class "gs-titlebar gs-drag" and keep a 56px ".lights" spacer at its left
 * on macOS (on Windows, keep ~140px clear at the right for the overlay buttons instead).
 */
