import { useState, useEffect } from "react";
import { useT } from "~/lib/i18n";
import { getDefaultStorageDir } from "~/lib/tauri";
import { SettingsCard, SettingsRow } from "./SettingsCard";
import { FolderOpen } from "lucide-react";

export function FilesTab() {
  const t = useT();
  const [storageDir, setStorageDir] = useState("");

  useEffect(() => {
    getDefaultStorageDir()
      .then(setStorageDir)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <SettingsCard title={t("files")}>
        <SettingsRow label={t("files")}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="truncate max-w-[250px]">{storageDir}</span>
          </div>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}
