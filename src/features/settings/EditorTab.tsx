import { useT } from "~/lib/i18n";
import {
  useSettingsStore,
  type LineHeight,
  type ContentWidth,
} from "~/stores/settings-store";
import { SettingsCard, SettingsRow } from "./SettingsCard";
import { cn } from "~/lib/utils";

const LINE_HEIGHTS: LineHeight[] = ["compact", "comfortable", "loose"];
const CONTENT_WIDTHS: ContentWidth[] = ["narrow", "standard", "wide"];

export function EditorTab() {
  const t = useT();
  const lineHeight = useSettingsStore((s) => s.lineHeight);
  const contentWidth = useSettingsStore((s) => s.contentWidth);
  const setLineHeight = useSettingsStore((s) => s.setLineHeight);
  const setContentWidth = useSettingsStore((s) => s.setContentWidth);

  return (
    <div className="space-y-4">
      <SettingsCard title={t("reading")}>
        <SettingsRow label={t("lineHeight")}>
          <SegmentedControl
            options={LINE_HEIGHTS.map((v) => ({ value: v, label: t(v) }))}
            value={lineHeight}
            onChange={(v) => setLineHeight(v as LineHeight)}
          />
        </SettingsRow>
        <SettingsRow label={t("contentWidth")}>
          <SegmentedControl
            options={CONTENT_WIDTHS.map((v) => ({ value: v, label: t(v) }))}
            value={contentWidth}
            onChange={(v) => setContentWidth(v as ContentWidth)}
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-white text-foreground shadow-sm dark:bg-zinc-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
