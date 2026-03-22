import { invoke } from '@tauri-apps/api/core';

// ── Types (mirrors Rust AppConfig) ──────────────

export interface FontEntry {
  family: string;
  size: number;
}

export interface AppConfig {
  theme: string;
  locale: string;
  layout: string;
  font: {
    ui: FontEntry;
    body: FontEntry;
    code: FontEntry;
  };
  reading: {
    lineHeight: string;
    contentWidth: string;
    renderingMode: string;
  };
}

// ── In-memory cache ─────────────────────────────

let _cache: AppConfig | null = null;

export async function loadFullConfig(): Promise<AppConfig> {
  const config = await invoke<AppConfig>('load_config');
  _cache = config;
  return config;
}

export function updateAndSave(mutator: (config: AppConfig) => void): void {
  if (!_cache) return;
  mutator(_cache);
  invoke('save_config', { config: _cache }).catch((e) =>
    console.error('Failed to save config:', e),
  );
}

export async function resetConfig(): Promise<AppConfig> {
  const config = await invoke<AppConfig>('reset_config');
  _cache = config;
  return config;
}

// ── localStorage Migration ──────────────────────

export async function migrateFromLocalStorage(config: AppConfig): Promise<void> {
  let dirty = false;

  // Migrate settings
  const rawSettings = localStorage.getItem('settings');
  if (rawSettings) {
    try {
      const s = JSON.parse(rawSettings);
      if (s.theme) config.theme = s.theme;
      if (s.uiFont) config.font.ui.family = s.uiFont;
      if (typeof s.uiFontSize === 'number') config.font.ui.size = s.uiFontSize;
      if (s.bodyFont) config.font.body.family = s.bodyFont;
      if (typeof s.bodyFontSize === 'number') config.font.body.size = s.bodyFontSize;
      if (s.codeFont) config.font.code.family = s.codeFont;
      if (typeof s.codeFontSize === 'number') config.font.code.size = s.codeFontSize;
      if (s.lineHeight) config.reading.lineHeight = s.lineHeight;
      if (s.contentWidth) config.reading.contentWidth = s.contentWidth;
      dirty = true;
    } catch {
      // corrupted, skip
    }
    localStorage.removeItem('settings');
  }

  // Migrate legacy theme key
  const legacyTheme = localStorage.getItem('theme');
  if (legacyTheme) {
    config.theme = legacyTheme;
    dirty = true;
    localStorage.removeItem('theme');
  }

  // Migrate layout mode
  const rawLayout = localStorage.getItem('layoutMode');
  if (rawLayout) {
    config.layout = rawLayout;
    dirty = true;
    localStorage.removeItem('layoutMode');
  }

  // Migrate locale
  const rawLocale = localStorage.getItem('locale');
  if (rawLocale) {
    config.locale = rawLocale;
    dirty = true;
    localStorage.removeItem('locale');
  }

  if (dirty) {
    _cache = config;
    await invoke('save_config', { config });
  }
}
