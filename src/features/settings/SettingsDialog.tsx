import { useState } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useAppStore } from "~/stores/app-store";
import { useT } from "~/lib/i18n";
import { cn } from "~/lib/utils";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { EditorTab } from "./EditorTab";
import { FilesTab } from "./FilesTab";
import { ShortcutsTab } from "./ShortcutsTab";

type TabId = "general" | "appearance" | "editor" | "files" | "shortcuts";

const TABS: TabId[] = ["general", "appearance", "editor", "files", "shortcuts"];

export function SettingsDialog() {
  const t = useT();
  const open = useAppStore((s) => s.settingsOpen);
  const onOpenChange = useAppStore((s) =>
    s.settingsOpen ? s.closeSettings : s.openSettings
  );
  const closeSettings = useAppStore((s) => s.closeSettings);

  const [activeTab, setActiveTab] = useState<TabId>("general");

  const tabLabels: Record<TabId, string> = {
    general: t("general"),
    appearance: t("appearance"),
    editor: t("editor"),
    files: t("files"),
    shortcuts: t("shortcuts"),
  };

  const tabContent: Record<TabId, React.ReactNode> = {
    general: <GeneralTab />,
    appearance: <AppearanceTab />,
    editor: <EditorTab />,
    files: <FilesTab />,
    shortcuts: <ShortcutsTab />,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? undefined : closeSettings())}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Arc-style capsule tab navigation */}
        <div className="flex justify-center gap-1 border-b bg-muted px-6 pt-5 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {tabContent[activeTab]}
        </div>
      </DialogContent>
    </Dialog>
  );
}
