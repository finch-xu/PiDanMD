import { useState, useEffect } from "react";
import { useT } from "~/lib/i18n";
import {
  useSettingsStore,
  BUILTIN_TEXT_FONTS,
  BUILTIN_CODE_FONTS,
  type Theme,
} from "~/stores/settings-store";
import { listSystemFonts } from "~/lib/tauri";
import { Select, SelectItem } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { SettingsCard, SettingsRow } from "./SettingsCard";
import { cn } from "~/lib/utils";
import { Sun, Moon, Monitor, Minus, Plus } from "lucide-react";

const THEMES: { value: Theme; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

export function AppearanceTab() {
  const t = useT();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
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
      {/* Theme */}
      <SettingsCard title={t("theme")}>
        <div className="flex gap-2">
          {THEMES.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                theme === value
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-muted-foreground hover:text-foreground dark:bg-zinc-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {value === "system"
                ? t("followSystem")
                : value === "light"
                ? t("lightTheme")
                : t("darkTheme")}
            </button>
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
