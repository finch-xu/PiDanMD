import { useT } from "~/lib/i18n";
import { SettingsCard } from "./SettingsCard";

const isMac = navigator.userAgent.includes("Mac");
const mod = isMac ? "\u2318" : "Ctrl";

const SHORTCUTS = [
  { keys: [`${mod}`, ","], action: "settings" },
  { keys: [`${mod}`, "S"], action: "save" },
  { keys: [`${mod}`, "B"], action: "Bold" },
  { keys: [`${mod}`, "I"], action: "Italic" },
  { keys: [`${mod}`, "Shift", "X"], action: "Strikethrough" },
  { keys: [`${mod}`, "E"], action: "Code" },
  { keys: [`${mod}`, "Shift", "H"], action: "Highlight" },
  { keys: [`${mod}`, "Z"], action: "Undo" },
  { keys: [`${mod}`, "Shift", "Z"], action: "Redo" },
  { keys: [`${mod}`, "Shift", "8"], action: "Bullet List" },
  { keys: [`${mod}`, "Shift", "7"], action: "Ordered List" },
  { keys: [`${mod}`, "Shift", "9"], action: "Task List" },
  { keys: ["Escape"], action: "Close Dialog" },
];

export function ShortcutsTab() {
  const t = useT();

  return (
    <div className="space-y-4">
      <SettingsCard title={t("shortcuts")}>
        <div className="space-y-2">
          {SHORTCUTS.map(({ keys, action }) => (
            <div
              key={action}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm">{action}</span>
              <div className="flex items-center gap-1">
                {keys.map((key, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                    )}
                    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground shadow-sm">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
