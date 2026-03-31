import { useT, useI18nStore, VALID_LOCALES, type Locale } from "~/lib/i18n";
import { updateAndSave } from "~/lib/storage";
import { useSettingsStore } from "~/stores/settings-store";
import { Select, SelectItem } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { SettingsCard, SettingsRow } from "./SettingsCard";
import { RotateCcw } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "en-US": "English",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
};

export function GeneralTab() {
  const t = useT();
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);

  const handleLocaleChange = (value: string) => {
    const l = value as Locale;
    setLocale(l);
    updateAndSave((c) => {
      c.locale = l;
    });
  };

  return (
    <div className="space-y-4">
      <SettingsCard title={t("language")}>
        <SettingsRow label={t("language")}>
          <Select value={locale} onValueChange={handleLocaleChange}>
            {VALID_LOCALES.map((l) => (
              <SelectItem key={l} value={l}>
                {LOCALE_LABELS[l]}
              </SelectItem>
            ))}
          </Select>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <Button
          variant="destructive"
          size="sm"
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("resetConfig")}
        </Button>
      </SettingsCard>
    </div>
  );
}
