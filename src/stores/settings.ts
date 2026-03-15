import { createSignal, createMemo } from 'solid-js';
import { emit, listen } from '@tauri-apps/api/event';
import type { AppConfig } from '~/lib/config-persistence';
import { updateAndSave } from '~/lib/config-persistence';

// ── Types ──────────────────────────────────────

export type Theme = 'system' | 'light' | 'dark' | 'mocha' | 'latte' | 'frappe' | 'macchiato';
export type LineHeight = 'compact' | 'comfortable' | 'loose';
export type ContentWidth = 'narrow' | 'standard' | 'wide';

export interface Settings {
  theme: Theme;
  uiFont: string;
  bodyFont: string;
  codeFont: string;
  symbolFont: string;
  uiFontSize: number;
  bodyFontSize: number;
  codeFontSize: number;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
}

// ── Built-in Font Definitions ─────────────────

export interface BuiltinFont {
  name: string;
  label: string;
  css: string;
}

export const BUILTIN_TEXT_FONTS: BuiltinFont[] = [
  { name: 'LXGW WenKai Screen', label: '霞鹜文楷 Screen', css: "'LXGW WenKai Screen', serif" },
];

export const BUILTIN_CODE_FONTS: BuiltinFont[] = [
  { name: 'Cascadia Code NF', label: 'Cascadia Code NF', css: "'Cascadia Code NF', monospace" },
  { name: 'LXGW WenKai Mono Screen', label: '霞鹜文楷 Mono Screen', css: "'LXGW WenKai Mono Screen', monospace" },
];

function escapeCssFontName(name: string): string {
  return name.replace(/'/g, "\\'");
}

export function fontToCss(name: string, builtinList: BuiltinFont[]): string {
  const found = builtinList.find((f) => f.name === name);
  if (found) return found.css;
  return `'${escapeCssFontName(name)}', sans-serif`;
}

// Heading font: always use sans-serif variant
function headingFontCss(bodyFontName: string): string {
  if (bodyFontName === 'LXGW WenKai Screen') return "'LXGW WenKai Screen', sans-serif";
  return "'Source Han Sans', 'Noto Sans CJK SC', sans-serif";
}

// ── Other Constants ───────────────────────────

export const LINE_HEIGHT_MAP: Record<LineHeight, number> = {
  compact: 1.6,
  comfortable: 1.9,
  loose: 2.2,
};

export const CODE_LINE_HEIGHT_MAP: Record<LineHeight, number> = {
  compact: 1.4,
  comfortable: 1.6,
  loose: 1.8,
};

export const CONTENT_WIDTH_MAP: Record<ContentWidth, string> = {
  narrow: '600px',
  standard: '700px',
  wide: '860px',
};

const DEFAULTS: Settings = {
  theme: 'system',
  uiFont: 'LXGW WenKai Screen',
  bodyFont: 'LXGW WenKai Screen',
  codeFont: 'Cascadia Code NF',
  symbolFont: 'Noto Color Emoji',
  uiFontSize: 16,
  bodyFontSize: 16,
  codeFontSize: 16,
  lineHeight: 'comfortable',
  contentWidth: 'standard',
};

// ── Theme Resolution ──────────────────────────

function resolveDataTheme(theme: Theme): string {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

// ── Symbol Font Helper ────────────────────────

function withSymbolFont(fontCss: string, symbolFont: string): string {
  if (symbolFont === 'system') return fontCss;
  const safeSymbol = escapeCssFontName(symbolFont);
  const match = fontCss.match(/,\s*(serif|sans-serif|monospace)\s*$/);
  if (match) {
    return fontCss.replace(match[0], `, '${safeSymbol}'${match[0]}`);
  }
  return `${fontCss}, '${safeSymbol}'`;
}

// ── CSS Variable Injection ─────────────────────

function applySettings(s: Settings) {
  const root = document.documentElement;

  root.dataset.theme = resolveDataTheme(s.theme);

  root.style.setProperty('--app-ui-font', fontToCss(s.uiFont, BUILTIN_TEXT_FONTS));
  root.style.setProperty('--editor-font-body', withSymbolFont(fontToCss(s.bodyFont, BUILTIN_TEXT_FONTS), s.symbolFont));
  root.style.setProperty('--editor-font-heading', withSymbolFont(headingFontCss(s.bodyFont), s.symbolFont));
  root.style.setProperty('--editor-font-code', fontToCss(s.codeFont, BUILTIN_CODE_FONTS));
  root.style.setProperty('--app-ui-font-size', `${s.uiFontSize}px`);
  root.style.setProperty('--editor-font-size', String(s.bodyFontSize));
  root.style.setProperty('--editor-code-font-size', String(s.codeFontSize));
  root.style.setProperty('--editor-line-height-body', String(LINE_HEIGHT_MAP[s.lineHeight]));
  root.style.setProperty('--editor-line-height-code', String(CODE_LINE_HEIGHT_MAP[s.lineHeight]));
  root.style.setProperty('--editor-content-width', CONTENT_WIDTH_MAP[s.contentWidth]);
}

// ── Signals ────────────────────────────────────

const [settings, _setSettings] = createSignal<Settings>({ ...DEFAULTS });

export function initSettingsFromConfig(config: AppConfig) {
  const s: Settings = {
    theme: config.theme as Theme,
    uiFont: config.font.ui.family,
    uiFontSize: config.font.ui.size,
    bodyFont: config.font.body.family,
    bodyFontSize: config.font.body.size,
    codeFont: config.font.code.family,
    codeFontSize: config.font.code.size,
    symbolFont: config.font.symbol ?? 'Noto Color Emoji',
    lineHeight: config.reading.lineHeight as LineHeight,
    contentWidth: config.reading.contentWidth as ContentWidth,
  };
  _setSettings(s);
  applySettings(s);
}

function updateSettings(patch: Partial<Settings>) {
  const cur = settings();
  if ((Object.keys(patch) as (keyof Settings)[]).every((k) => cur[k] === patch[k])) return;
  const next = { ...cur, ...patch };
  _setSettings(next);
  applySettings(next);
  emit('settings-changed', next);

  updateAndSave((c) => {
    c.theme = next.theme;
    c.font.ui = { family: next.uiFont, size: next.uiFontSize };
    c.font.body = { family: next.bodyFont, size: next.bodyFontSize };
    c.font.code = { family: next.codeFont, size: next.codeFontSize };
    c.font.symbol = next.symbolFont;
    c.reading.lineHeight = next.lineHeight;
    c.reading.contentWidth = next.contentWidth;
  });
}

// Cross-window sync
listen<Settings>('settings-changed', (event) => {
  const incoming = event.payload;
  const cur = settings();
  if (JSON.stringify(cur) !== JSON.stringify(incoming)) {
    _setSettings(incoming);
    applySettings(incoming);
  }
});

// ── System Theme Listener ─────────────────────

const [systemDark, setSystemDark] = createSignal(
  window.matchMedia('(prefers-color-scheme: dark)').matches,
);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  setSystemDark(e.matches);
  if (settings().theme === 'system') {
    document.documentElement.dataset.theme = resolveDataTheme('system');
  }
});

const resolvedTheme = createMemo(() => {
  const t = settings().theme;
  if (t === 'system') return systemDark() ? 'dark' : 'light';
  return t;
});

const theme = () => settings().theme;
const setTheme = (t: Theme) => updateSettings({ theme: t });

export { settings, updateSettings, theme, setTheme, resolvedTheme };
