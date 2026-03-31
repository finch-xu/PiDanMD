import { create } from "zustand";
import { updateAndSave, resetConfig, type AppConfig } from "~/lib/storage";

export type Theme = "system" | "light" | "dark";
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
    name: "Cascadia Code NF",
    label: "Cascadia Code NF",
    css: "'Cascadia Code NF', monospace",
  },
  {
    name: "LXGW WenKai Mono Screen",
    label: "霞鹜文楷 Mono Screen",
    css: "'LXGW WenKai Mono Screen', monospace",
  },
];

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

function resolveThemeClass(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

interface SettingsState {
  theme: Theme;
  uiFont: string;
  bodyFont: string;
  codeFont: string;
  uiFontSize: number;
  bodyFontSize: number;
  codeFontSize: number;
  lineHeight: LineHeight;
  contentWidth: ContentWidth;
  resolvedTheme: "light" | "dark";

  initFromConfig: (config: AppConfig) => void;
  setTheme: (theme: Theme) => void;
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

function applyToDOM(state: {
  theme: Theme;
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
  const resolved = resolveThemeClass(state.theme);
  root.classList.toggle("dark", resolved === "dark");

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
  theme: Theme;
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
    c.theme = state.theme;
    c.font.ui = { family: state.uiFont, size: state.uiFontSize };
    c.font.body = { family: state.bodyFont, size: state.bodyFontSize };
    c.font.code = { family: state.codeFont, size: state.codeFontSize };
    c.reading.lineHeight = state.lineHeight;
    c.reading.contentWidth = state.contentWidth;
  });
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const state = get();
      if (state.theme === "system") {
        const resolved = resolveThemeClass("system");
        document.documentElement.classList.toggle("dark", resolved === "dark");
        set({ resolvedTheme: resolved });
      }
    });

  const update = (patch: Partial<SettingsState>) => {
    set(patch);
    const state = get();
    applyToDOM(state);
    persistSettings(state);
  };

  // Initial values are empty placeholders — the real defaults live in the
  // Rust backend (AppConfig::default in config.rs). They get populated by
  // initFromConfig() during app startup. This keeps a single source of truth.
  return {
    theme: "system" as Theme,
    uiFont: "",
    bodyFont: "",
    codeFont: "",
    uiFontSize: 0,
    bodyFontSize: 0,
    codeFontSize: 0,
    lineHeight: "comfortable" as LineHeight,
    contentWidth: "standard" as ContentWidth,
    resolvedTheme: resolveThemeClass("system"),

    initFromConfig: (config) => {
      const state = {
        theme: (config.theme as Theme) || "system",
        uiFont: config.font.ui.family,
        bodyFont: config.font.body.family,
        codeFont: config.font.code.family,
        uiFontSize: config.font.ui.size,
        bodyFontSize: config.font.body.size,
        codeFontSize: config.font.code.size,
        lineHeight: (config.reading.lineHeight as LineHeight) || "comfortable",
        contentWidth:
          (config.reading.contentWidth as ContentWidth) || "standard",
        resolvedTheme: resolveThemeClass(
          (config.theme as Theme) || "system"
        ),
      };
      set(state);
      applyToDOM(state);
    },

    setTheme: (theme) => update({ theme, resolvedTheme: resolveThemeClass(theme) }),
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
