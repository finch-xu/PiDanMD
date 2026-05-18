// ── 主题系统 ──
//
// v1.0 简化为 3 个主题：Light（宣纸）/ Paper（古书）/ Dark（暖灰夜）。
// 全部使用松花蛋黄作为统一强调色——呼应"皮蛋记"的产品名。
// Dark 主题启用 4 层 surface 分层，告别"黑白反转"廉价感。

export type Appearance = "system" | "light" | "dark";

export interface ThemeDefinition {
  id: string;
  name: string;
  mode: "light" | "dark";
  /** 主题预览色板（设置面板的小色块）*/
  preview: { bg: string; fg: string; accent: string };
  /** 应用到 :root 的 CSS 变量覆盖 */
  vars: Record<string, string>;
}

// 松花蛋黄——v1.0 统一强调色（皮蛋的标志性色彩）
const PIDAN_YELLOW = "oklch(0.72 0.12 80)";
const PIDAN_YELLOW_DEEP = "oklch(0.58 0.13 70)"; // 强调色在浅色背景上的可读版本

// ── Light Themes ──

const defaultLight: ThemeDefinition = {
  id: "default-light",
  name: "宣纸",
  mode: "light",
  preview: { bg: "#fbfaf6", fg: "#1a1916", accent: "#b8893a" },
  vars: {
    "--background": "oklch(0.985 0.005 85)",         // 略带米黄的宣纸白
    "--foreground": "oklch(0.20 0.005 60)",          // 墨黑
    "--card": "oklch(0.97 0.006 85)",                // L1 卡片
    "--card-foreground": "oklch(0.20 0.005 60)",
    "--popover": "oklch(0.99 0.005 85)",
    "--popover-foreground": "oklch(0.20 0.005 60)",
    "--primary": "oklch(0.22 0.008 60)",             // 主操作 - 接近墨色
    "--primary-foreground": "oklch(0.98 0.005 85)",
    "--secondary": "oklch(0.94 0.008 85)",
    "--secondary-foreground": "oklch(0.22 0.005 60)",
    "--muted": "oklch(0.94 0.008 85)",
    "--muted-foreground": "oklch(0.50 0.010 60)",    // 次要文字
    "--accent": "oklch(0.93 0.012 85)",              // hover 态
    "--accent-foreground": "oklch(0.22 0.005 60)",
    "--destructive": "oklch(0.55 0.22 25)",
    "--border": "oklch(0.91 0.008 85)",
    "--input": "oklch(0.93 0.008 85)",
    "--ring": PIDAN_YELLOW_DEEP,                     // focus ring 用松花蛋黄
    "--sidebar": "oklch(0.97 0.006 85)",
    "--sidebar-foreground": "oklch(0.22 0.005 60)",
    "--sidebar-border": "oklch(0.91 0.008 85)",
  },
};

const paper: ThemeDefinition = {
  id: "paper",
  name: "古书",
  mode: "light",
  preview: { bg: "#faf6ef", fg: "#3b3228", accent: "#8b6914" },
  vars: {
    "--background": "oklch(0.97 0.012 80)",          // 暖米黄
    "--foreground": "oklch(0.27 0.025 60)",          // 深褐
    "--card": "oklch(0.96 0.015 75)",
    "--card-foreground": "oklch(0.27 0.025 60)",
    "--popover": "oklch(0.97 0.012 80)",
    "--popover-foreground": "oklch(0.27 0.025 60)",
    "--primary": "oklch(0.50 0.10 70)",              // 琥珀金
    "--primary-foreground": "oklch(0.98 0.008 80)",
    "--secondary": "oklch(0.94 0.015 75)",
    "--secondary-foreground": "oklch(0.27 0.025 60)",
    "--muted": "oklch(0.94 0.015 75)",
    "--muted-foreground": "oklch(0.58 0.035 60)",
    "--accent": "oklch(0.93 0.018 70)",
    "--accent-foreground": "oklch(0.27 0.025 60)",
    "--destructive": "oklch(0.55 0.20 25)",
    "--border": "oklch(0.90 0.018 70)",
    "--input": "oklch(0.92 0.018 70)",
    "--ring": "oklch(0.50 0.10 70)",
    "--sidebar": "oklch(0.96 0.015 75)",
    "--sidebar-foreground": "oklch(0.27 0.025 60)",
    "--sidebar-border": "oklch(0.90 0.018 70)",
  },
};

// ── Dark Theme ──

const defaultDark: ThemeDefinition = {
  id: "default-dark",
  name: "暖灰夜",
  mode: "dark",
  preview: { bg: "#1d1c1a", fg: "#eae4d6", accent: "#d4a253" },
  vars: {
    // surface 分层（L0 ~ L3，明度逐级提升 ~ 0.04）
    "--background": "oklch(0.18 0.008 60)",          // L0 主背景 - 暖灰
    "--card": "oklch(0.22 0.008 60)",                // L1 卡片
    "--popover": "oklch(0.24 0.008 60)",             // L1.5 浮层
    "--secondary": "oklch(0.26 0.008 60)",           // L2 次要表面
    "--muted": "oklch(0.24 0.008 60)",
    "--accent": "oklch(0.28 0.010 60)",              // L2.5 hover 态
    "--border": "oklch(0.30 0.010 60)",              // L3 边框
    "--input": "oklch(0.26 0.010 60)",

    // 前景色
    "--foreground": "oklch(0.92 0.008 80)",          // 米色主文字
    "--card-foreground": "oklch(0.92 0.008 80)",
    "--popover-foreground": "oklch(0.92 0.008 80)",
    "--secondary-foreground": "oklch(0.92 0.008 80)",
    "--muted-foreground": "oklch(0.66 0.010 70)",    // 次要文字
    "--accent-foreground": "oklch(0.94 0.008 80)",

    // 主操作 + 强调色
    "--primary": "oklch(0.92 0.008 80)",             // 主操作（深底浅按钮）
    "--primary-foreground": "oklch(0.20 0.008 60)",
    "--destructive": "oklch(0.62 0.22 25)",
    "--ring": PIDAN_YELLOW,

    // sidebar 用同色系（如果未来要重启 sidebar）
    "--sidebar": "oklch(0.20 0.008 60)",
    "--sidebar-foreground": "oklch(0.92 0.008 80)",
    "--sidebar-border": "oklch(0.28 0.010 60)",
  },
};

// ── Exports ──

export const LIGHT_THEMES: ThemeDefinition[] = [defaultLight, paper];
export const DARK_THEMES: ThemeDefinition[] = [defaultDark];
export const ALL_THEMES: ThemeDefinition[] = [...LIGHT_THEMES, ...DARK_THEMES];

export function getTheme(id: string): ThemeDefinition | undefined {
  return ALL_THEMES.find((t) => t.id === id);
}

// v0.x 老用户主题迁移到 v1.0
export const LEGACY_THEME_MIGRATIONS: Record<string, string> = {
  claude: "default-light",
  night: "default-dark",
};
