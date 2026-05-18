import { create } from "zustand";
import { updateAndSave, resetConfig, type AppConfig } from "~/lib/storage";
import {
  type Appearance,
  LIGHT_THEMES,
  DARK_THEMES,
  getTheme,
  type ThemeDefinition,
  LEGACY_THEME_MIGRATIONS,
} from "~/lib/themes";

export type LineHeight = "compact" | "comfortable" | "loose";
export type ContentWidth = "narrow" | "standard" | "wide";

export interface BuiltinFont {
  name: string;
  label: string;
  css: string;
}

export const BUILTIN_TEXT_FONTS: BuiltinFont[] = [
  {
    name: "LXGW WenKai Screen",
    label: "霞鹜文楷 Screen",
    css: "'LXGW WenKai Screen', serif",
  },
];

export const BUILTIN_CODE_FONTS: BuiltinFont[] = [
  {
    name: "LXGW WenKai Mono Screen",
    label: "霞鹜文楷 Mono Screen",
    css: "'LXGW WenKai Mono Screen', monospace",
  },
];

const LEGACY_CODE_FONT_MIGRATIONS: Record<string, string> = {
  "Cascadia Code NF": "LXGW WenKai Mono Screen",
};

export const LINE_HEIGHT_MAP: Record<LineHeight, number> = {
  compact: 1.6,
  comfortable: 1.9,
  loose: 2.2,
};

export const CONTENT_WIDTH_MAP: Record<ContentWidth, string> = {
  narrow: "600px",
  standard: "700px",
  wide: "860px",
};

function fontToCss(name: string, builtinList: BuiltinFont[]): string {
  const found = builtinList.find((f) => f.name === name);
  if (found) return found.css;
  return `'${name.replace(/'/g, "\\'")}', sans-serif`;
}

function resolveMode(appearance: Appearance): "light" | "dark" {
  if (appearance === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return appearance;
}

// ── Apply theme CSS variables to DOM ──

function applyThemeToDOM(theme: ThemeDefinition) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

function applySettingsToDOM(state: {
  appearance: Appearance;
  lightTheme: string;
  darkTheme: string;
  uiFont: string;
  bodyFont: string;
  codeFont: string;
  uiFontSize: number;
  bodyFontSize: number;
  codeFontSize: number;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
}) {
  const root = document.documentElement;
  const mode = resolveMode(state.appearance);

  // Toggle dark class
  root.classList.toggle("dark", mode === "dark");

  // Apply the appropriate theme
  const themeId = mode === "dark" ? state.darkTheme : state.lightTheme;
  const theme = getTheme(themeId);
  if (theme) {
    applyThemeToDOM(theme);
  }

  // Font & reading settings
  root.style.setProperty(
    "--app-ui-font",
    fontToCss(state.uiFont, BUILTIN_TEXT_FONTS)
  );
  root.style.setProperty(
    "--editor-font-body",
    fontToCss(state.bodyFont, BUILTIN_TEXT_FONTS)
  );
  root.style.setProperty(
    "--editor-font-code",
    fontToCss(state.codeFont, BUILTIN_CODE_FONTS)
  );
  root.style.setProperty("--app-ui-font-size", `${state.uiFontSize}px`);
  root.style.setProperty("--editor-font-size", `${state.bodyFontSize}px`);
  root.style.setProperty("--editor-code-font-size", `${state.codeFontSize}px`);
  root.style.setProperty(
    "--editor-line-height",
    String(LINE_HEIGHT_MAP[state.lineHeight])
  );
  root.style.setProperty(
    "--editor-content-width",
    CONTENT_WIDTH_MAP[state.contentWidth]
  );
}

function persistSettings(state: {
  appearance: Appearance;
  lightTheme: string;
  darkTheme: string;
  uiFont: string;
  bodyFont: string;
  codeFont: string;
  uiFontSize: number;
  bodyFontSize: number;
  codeFontSize: number;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
}) {
  updateAndSave((c) => {
    c.appearance = state.appearance;
    c.lightTheme = state.lightTheme;
    c.darkTheme = state.darkTheme;
    c.font.ui = { family: state.uiFont, size: state.uiFontSize };
    c.font.body = { family: state.bodyFont, size: state.bodyFontSize };
    c.font.code = { family: state.codeFont, size: state.codeFontSize };
    c.reading.lineHeight = state.lineHeight;
    c.reading.contentWidth = state.contentWidth;
  });
}

// ── Store ──

interface SettingsState {
  appearance: Appearance;
  lightTheme: string;
  darkTheme: string;
  resolvedMode: "light" | "dark";

  uiFont: string;
  bodyFont: string;
  codeFont: string;
  uiFontSize: number;
  bodyFontSize: number;
  codeFontSize: number;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;

  initFromConfig: (config: AppConfig) => void;
  setAppearance: (appearance: Appearance) => void;
  setLightTheme: (id: string) => void;
  setDarkTheme: (id: string) => void;
  setUiFont: (font: string) => void;
  setBodyFont: (font: string) => void;
  setCodeFont: (font: string) => void;
  setUiFontSize: (size: number) => void;
  setBodyFontSize: (size: number) => void;
  setCodeFontSize: (size: number) => void;
  setLineHeight: (lh: LineHeight) => void;
  setContentWidth: (cw: ContentWidth) => void;
  resetToDefaults: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const state = get();
      if (state.appearance === "system") {
        const mode = resolveMode("system");
        set({ resolvedMode: mode });
        applySettingsToDOM(state);
      }
    });

  const update = (patch: Partial<SettingsState>) => {
    set(patch);
    const state = get();
    // Recompute resolved mode if appearance changed
    if ("appearance" in patch) {
      const mode = resolveMode(state.appearance);
      set({ resolvedMode: mode });
    }
    applySettingsToDOM(state);
    persistSettings(state);
  };

  // Initial values are empty placeholders — the real defaults live in the
  // Rust backend (AppConfig::default in config.rs). They get populated by
  // initFromConfig() during app startup.
  return {
    appearance: "system" as Appearance,
    lightTheme: "default-light",
    darkTheme: "default-dark",
    resolvedMode: resolveMode("system"),

    uiFont: "",
    bodyFont: "",
    codeFont: "",
    uiFontSize: 0,
    bodyFontSize: 0,
    codeFontSize: 0,
    lineHeight: "comfortable" as LineHeight,
    contentWidth: "standard" as ContentWidth,

    initFromConfig: (config) => {
      const appearance = (config.appearance as Appearance) || "system";
      const rawLightTheme = config.lightTheme || "default-light";
      const rawDarkTheme = config.darkTheme || "default-dark";
      const lightTheme = LEGACY_THEME_MIGRATIONS[rawLightTheme] ?? rawLightTheme;
      const darkTheme = LEGACY_THEME_MIGRATIONS[rawDarkTheme] ?? rawDarkTheme;
      const rawCodeFont = config.font.code.family;
      const codeFont = LEGACY_CODE_FONT_MIGRATIONS[rawCodeFont] ?? rawCodeFont;
      const state = {
        appearance,
        lightTheme,
        darkTheme,
        resolvedMode: resolveMode(appearance),
        uiFont: config.font.ui.family,
        bodyFont: config.font.body.family,
        codeFont,
        uiFontSize: config.font.ui.size,
        bodyFontSize: config.font.body.size,
        codeFontSize: config.font.code.size,
        lineHeight: (config.reading.lineHeight as LineHeight) || "comfortable",
        contentWidth: (config.reading.contentWidth as ContentWidth) || "standard",
      };
      set(state);
      applySettingsToDOM(state);
    },

    setAppearance: (appearance) =>
      update({ appearance, resolvedMode: resolveMode(appearance) }),
    setLightTheme: (lightTheme) => update({ lightTheme }),
    setDarkTheme: (darkTheme) => update({ darkTheme }),
    setUiFont: (uiFont) => update({ uiFont }),
    setBodyFont: (bodyFont) => update({ bodyFont }),
    setCodeFont: (codeFont) => update({ codeFont }),
    setUiFontSize: (uiFontSize) => update({ uiFontSize }),
    setBodyFontSize: (bodyFontSize) => update({ bodyFontSize }),
    setCodeFontSize: (codeFontSize) => update({ codeFontSize }),
    setLineHeight: (lineHeight) => update({ lineHeight }),
    setContentWidth: (contentWidth) => update({ contentWidth }),

    resetToDefaults: async () => {
      const config = await resetConfig();
      get().initFromConfig(config);
    },
  };
});

// Re-export for convenience
export { LIGHT_THEMES, DARK_THEMES } from "~/lib/themes";
export type { Appearance } from "~/lib/themes";
