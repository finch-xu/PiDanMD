import { useState, useEffect } from "react";
import { useT } from "~/lib/i18n";
import {
  useSettingsStore,
  BUILTIN_TEXT_FONTS,
  BUILTIN_CODE_FONTS,
  LIGHT_THEMES,
  DARK_THEMES,
  type Appearance,
} from "~/stores/settings-store";
import { listSystemFonts } from "~/lib/tauri";
import type { ThemeDefinition } from "~/lib/themes";
import { Select, SelectItem } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { SettingsCard, SettingsRow } from "./SettingsCard";
import { cn } from "~/lib/utils";
import { Sun, Moon, Monitor, Minus, Plus } from "lucide-react";

// ── Appearance Mode Selector ──

const APPEARANCES: {
  value: Appearance;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}[] = [
  { value: "light", icon: Sun, labelKey: "lightTheme" },
  { value: "dark", icon: Moon, labelKey: "darkTheme" },
  { value: "system", icon: Monitor, labelKey: "followSystem" },
];

export function AppearanceTab() {
  const t = useT();
  const appearance = useSettingsStore((s) => s.appearance);
  const lightTheme = useSettingsStore((s) => s.lightTheme);
  const darkTheme = useSettingsStore((s) => s.darkTheme);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const setLightTheme = useSettingsStore((s) => s.setLightTheme);
  const setDarkTheme = useSettingsStore((s) => s.setDarkTheme);

  const uiFont = useSettingsStore((s) => s.uiFont);
  const bodyFont = useSettingsStore((s) => s.bodyFont);
  const codeFont = useSettingsStore((s) => s.codeFont);
  const uiFontSize = useSettingsStore((s) => s.uiFontSize);
  const bodyFontSize = useSettingsStore((s) => s.bodyFontSize);
  const codeFontSize = useSettingsStore((s) => s.codeFontSize);
  const setUiFont = useSettingsStore((s) => s.setUiFont);
  const setBodyFont = useSettingsStore((s) => s.setBodyFont);
  const setCodeFont = useSettingsStore((s) => s.setCodeFont);
  const setUiFontSize = useSettingsStore((s) => s.setUiFontSize);
  const setBodyFontSize = useSettingsStore((s) => s.setBodyFontSize);
  const setCodeFontSize = useSettingsStore((s) => s.setCodeFontSize);

  const [systemFonts, setSystemFonts] = useState<string[]>([]);

  useEffect(() => {
    listSystemFonts()
      .then(setSystemFonts)
      .catch(() => {});
  }, []);

  const allTextFonts = [
    ...BUILTIN_TEXT_FONTS.map((f) => f.name),
    ...systemFonts,
  ];

  const allCodeFonts = [
    ...BUILTIN_CODE_FONTS.map((f) => f.name),
    ...systemFonts.filter(
      (f) =>
        f.toLowerCase().includes("mono") ||
        f.toLowerCase().includes("code") ||
        f.toLowerCase().includes("consol")
    ),
  ];

  return (
    <div className="space-y-4">
      {/* Appearance Mode */}
      <SettingsCard title={t("theme")}>
        <div className="flex gap-2">
          {APPEARANCES.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setAppearance(value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                appearance === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Light Theme Picker */}
      <SettingsCard title={t("lightTheme")}>
        <div className="flex gap-2">
          {LIGHT_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={lightTheme === theme.id}
              onClick={() => setLightTheme(theme.id)}
            />
          ))}
        </div>
      </SettingsCard>

      {/* Dark Theme Picker */}
      <SettingsCard title={t("darkTheme")}>
        <div className="flex gap-2">
          {DARK_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={darkTheme === theme.id}
              onClick={() => setDarkTheme(theme.id)}
            />
          ))}
        </div>
      </SettingsCard>

      {/* Fonts */}
      <SettingsCard title={t("typography")}>
        <FontRow
          label={t("uiLabel")}
          fontValue={uiFont}
          onFontChange={setUiFont}
          fontSize={uiFontSize}
          onFontSizeChange={setUiFontSize}
          fontOptions={allTextFonts}
        />
        <FontRow
          label={t("bodyLabel")}
          fontValue={bodyFont}
          onFontChange={setBodyFont}
          fontSize={bodyFontSize}
          onFontSizeChange={setBodyFontSize}
          fontOptions={allTextFonts}
        />
        <FontRow
          label={t("codeLabel")}
          fontValue={codeFont}
          onFontChange={setCodeFont}
          fontSize={codeFontSize}
          onFontSizeChange={setCodeFontSize}
          fontOptions={allCodeFonts}
        />
      </SettingsCard>
    </div>
  );
}

// ── Theme Card Component ──

function ThemeCard({
  theme,
  selected,
  onClick,
}: {
  theme: ThemeDefinition;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all",
        selected
          ? "ring-2 ring-primary bg-accent"
          : "bg-secondary hover:bg-accent/50"
      )}
    >
      {/* Preview swatch */}
      <div
        className="h-16 w-full rounded-lg border shadow-sm flex items-end p-2"
        style={{ backgroundColor: theme.preview.bg }}
      >
        <div className="flex gap-1">
          <div
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: theme.preview.fg }}
          />
          <div
            className="h-1.5 w-5 rounded-full"
            style={{ backgroundColor: theme.preview.accent }}
          />
        </div>
      </div>
      <span className="text-xs font-medium">{theme.name}</span>
    </button>
  );
}

// ── Font Row Component ──

function FontRow({
  label,
  fontValue,
  onFontChange,
  fontSize,
  onFontSizeChange,
  fontOptions,
}: {
  label: string;
  fontValue: string;
  onFontChange: (v: string) => void;
  fontSize: number;
  onFontSizeChange: (v: number) => void;
  fontOptions: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <Select
          value={fontValue}
          onValueChange={onFontChange}
          className="flex-1"
        >
          {fontOptions.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-xs tabular-nums">{fontSize}</span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
