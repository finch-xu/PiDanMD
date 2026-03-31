import { invoke } from "@tauri-apps/api/core";

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

let _cache: AppConfig | null = null;

export async function loadFullConfig(): Promise<AppConfig> {
  const config = await invoke<AppConfig>("load_config");
  _cache = config;
  return config;
}

export function getCachedConfig(): AppConfig | null {
  return _cache;
}

export function updateAndSave(mutator: (config: AppConfig) => void): void {
  if (!_cache) return;
  mutator(_cache);
  invoke("save_config", { config: _cache }).catch((e) =>
    console.error("Failed to save config:", e)
  );
}

export async function resetConfig(): Promise<AppConfig> {
  const config = await invoke<AppConfig>("reset_config");
  _cache = config;
  return config;
}
