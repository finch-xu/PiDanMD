// ── Theme System ──
//
// Each theme provides a complete set of CSS variable overrides.
// Themes are categorized as "light" or "dark" so the user can
// independently choose which theme to use for each mode.
//
// "appearance" controls the mode: system / light / dark
// "lightTheme" + "darkTheme" control which theme applies in each mode

export type Appearance = "system" | "light" | "dark";

export interface ThemeDefinition {
  id: string;
  name: string;
  mode: "light" | "dark";
  /** Representative color for the preview swatch */
  preview: { bg: string; fg: string; accent: string };
  /** CSS variable overrides applied to :root */
  vars: Record<string, string>;
}

// ── Light Themes ──

const defaultLight: ThemeDefinition = {
  id: "default-light",
  name: "Light",
  mode: "light",
  preview: { bg: "#ffffff", fg: "#09090b", accent: "#71717a" },
  vars: {
    "--background": "oklch(1 0 0)",
    "--foreground": "oklch(0.141 0.005 285.823)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.141 0.005 285.823)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.141 0.005 285.823)",
    "--primary": "oklch(0.141 0.005 285.823)",
    "--primary-foreground": "oklch(0.985 0 0)",
    "--secondary": "oklch(0.967 0.001 286.375)",
    "--secondary-foreground": "oklch(0.141 0.005 285.823)",
    "--muted": "oklch(0.967 0.001 286.375)",
    "--muted-foreground": "oklch(0.552 0.016 285.938)",
    "--accent": "oklch(0.967 0.001 286.375)",
    "--accent-foreground": "oklch(0.141 0.005 285.823)",
    "--destructive": "oklch(0.577 0.245 27.325)",
    "--border": "oklch(0.92 0.004 286.32)",
    "--input": "oklch(0.92 0.004 286.32)",
    "--ring": "oklch(0.141 0.005 285.823)",
    "--sidebar": "oklch(0.985 0 0)",
    "--sidebar-foreground": "oklch(0.141 0.005 285.823)",
    "--sidebar-border": "oklch(0.92 0.004 286.32)",
  },
};

const paper: ThemeDefinition = {
  id: "paper",
  name: "Paper",
  mode: "light",
  preview: { bg: "#faf6ef", fg: "#3b3228", accent: "#8b6914" },
  vars: {
    "--background": "oklch(0.97 0.012 80)",       // #faf6ef warm cream
    "--foreground": "oklch(0.27 0.025 60)",        // #3b3228 deep brown
    "--card": "oklch(0.96 0.015 75)",              // #f5f0e8
    "--card-foreground": "oklch(0.27 0.025 60)",
    "--popover": "oklch(0.97 0.012 80)",
    "--popover-foreground": "oklch(0.27 0.025 60)",
    "--primary": "oklch(0.50 0.10 70)",            // #8b6914 amber gold
    "--primary-foreground": "oklch(0.98 0.008 80)",
    "--secondary": "oklch(0.94 0.015 75)",         // #ede7db
    "--secondary-foreground": "oklch(0.27 0.025 60)",
    "--muted": "oklch(0.94 0.015 75)",
    "--muted-foreground": "oklch(0.58 0.035 60)",  // #8a7b6b warm gray-brown
    "--accent": "oklch(0.94 0.015 75)",
    "--accent-foreground": "oklch(0.27 0.025 60)",
    "--destructive": "oklch(0.55 0.20 25)",
    "--border": "oklch(0.90 0.018 70)",            // #e0d8cc warm tan
    "--input": "oklch(0.90 0.018 70)",
    "--ring": "oklch(0.50 0.10 70)",
    "--sidebar": "oklch(0.96 0.015 75)",
    "--sidebar-foreground": "oklch(0.27 0.025 60)",
    "--sidebar-border": "oklch(0.90 0.018 70)",
  },
};

const claude: ThemeDefinition = {
  id: "claude",
  name: "Claude",
  mode: "light",
  preview: { bg: "#faf9f5", fg: "#2d2b28", accent: "#da7756" },
  vars: {
    "--background": "oklch(0.98 0.008 85)",        // #faf9f5 warm off-white
    "--foreground": "oklch(0.24 0.012 55)",         // #2d2b28 dark brown-black
    "--card": "oklch(0.97 0.010 80)",               // #f5f3ee
    "--card-foreground": "oklch(0.24 0.012 55)",
    "--popover": "oklch(0.98 0.008 85)",
    "--popover-foreground": "oklch(0.24 0.012 55)",
    "--primary": "oklch(0.60 0.14 45)",             // #c96442 deep terracotta
    "--primary-foreground": "oklch(0.98 0.008 85)",
    "--secondary": "oklch(0.95 0.010 80)",
    "--secondary-foreground": "oklch(0.24 0.012 55)",
    "--muted": "oklch(0.95 0.010 80)",
    "--muted-foreground": "oklch(0.58 0.020 65)",   // #807a72 warm gray
    "--accent": "oklch(0.95 0.010 80)",
    "--accent-foreground": "oklch(0.24 0.012 55)",
    "--destructive": "oklch(0.55 0.22 25)",
    "--border": "oklch(0.92 0.012 75)",             // #e8e4dd
    "--input": "oklch(0.92 0.012 75)",
    "--ring": "oklch(0.65 0.15 42)",                // #da7756 Claude orange
    "--sidebar": "oklch(0.97 0.010 80)",
    "--sidebar-foreground": "oklch(0.24 0.012 55)",
    "--sidebar-border": "oklch(0.92 0.012 75)",
  },
};

// ── Dark Themes ──

const defaultDark: ThemeDefinition = {
  id: "default-dark",
  name: "Dark",
  mode: "dark",
  preview: { bg: "#09090b", fg: "#fafafa", accent: "#a1a1aa" },
  vars: {
    "--background": "oklch(0.141 0.005 285.823)",
    "--foreground": "oklch(0.985 0 0)",
    "--card": "oklch(0.141 0.005 285.823)",
    "--card-foreground": "oklch(0.985 0 0)",
    "--popover": "oklch(0.141 0.005 285.823)",
    "--popover-foreground": "oklch(0.985 0 0)",
    "--primary": "oklch(0.985 0 0)",
    "--primary-foreground": "oklch(0.141 0.005 285.823)",
    "--secondary": "oklch(0.274 0.006 286.033)",
    "--secondary-foreground": "oklch(0.985 0 0)",
    "--muted": "oklch(0.274 0.006 286.033)",
    "--muted-foreground": "oklch(0.716 0.01 286.067)",
    "--accent": "oklch(0.274 0.006 286.033)",
    "--accent-foreground": "oklch(0.985 0 0)",
    "--destructive": "oklch(0.577 0.245 27.325)",
    "--border": "oklch(0.274 0.006 286.033)",
    "--input": "oklch(0.274 0.006 286.033)",
    "--ring": "oklch(0.871 0.006 286.286)",
    "--sidebar": "oklch(0.141 0.005 285.823)",
    "--sidebar-foreground": "oklch(0.985 0 0)",
    "--sidebar-border": "oklch(0.274 0.006 286.033)",
  },
};

const night: ThemeDefinition = {
  id: "night",
  name: "Night",
  mode: "dark",
  preview: { bg: "#0a0a0a", fg: "#c8c8c8", accent: "#7aa2f7" },
  vars: {
    "--background": "oklch(0.08 0 0)",              // #0a0a0a near-black
    "--foreground": "oklch(0.82 0 0)",              // #c8c8c8 soft gray-white
    "--card": "oklch(0.11 0 0)",                    // #111111
    "--card-foreground": "oklch(0.82 0 0)",
    "--popover": "oklch(0.10 0 0)",
    "--popover-foreground": "oklch(0.82 0 0)",
    "--primary": "oklch(0.70 0.12 250)",            // #7aa2f7 soft blue
    "--primary-foreground": "oklch(0.08 0 0)",
    "--secondary": "oklch(0.16 0 0)",
    "--secondary-foreground": "oklch(0.80 0 0)",
    "--muted": "oklch(0.16 0 0)",
    "--muted-foreground": "oklch(0.52 0 0)",        // #707070
    "--accent": "oklch(0.16 0 0)",
    "--accent-foreground": "oklch(0.82 0 0)",
    "--destructive": "oklch(0.55 0.22 25)",
    "--border": "oklch(0.18 0 0)",                  // #1e1e1e
    "--input": "oklch(0.18 0 0)",
    "--ring": "oklch(0.70 0.12 250)",
    "--sidebar": "oklch(0.09 0 0)",
    "--sidebar-foreground": "oklch(0.82 0 0)",
    "--sidebar-border": "oklch(0.18 0 0)",
  },
};

// ── Exports ──

export const LIGHT_THEMES: ThemeDefinition[] = [defaultLight, paper, claude];
export const DARK_THEMES: ThemeDefinition[] = [defaultDark, night];
export const ALL_THEMES: ThemeDefinition[] = [...LIGHT_THEMES, ...DARK_THEMES];

export function getTheme(id: string): ThemeDefinition | undefined {
  return ALL_THEMES.find((t) => t.id === id);
}
