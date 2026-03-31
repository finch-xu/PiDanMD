import { useEffect, useCallback } from "react";
import { useAppStore, GRID_COLUMNS } from "./stores/app-store";
import { useEditorStore } from "./stores/editor-store";
import { TitleBar } from "./features/titlebar/TitleBar";
import { Sidebar } from "./features/sidebar/Sidebar";
import { Editor } from "./features/editor/Editor";
import { DocumentOutline } from "./features/outline/DocumentOutline";
import { StatusBar } from "./features/editor/StatusBar";
import { SettingsDialog } from "./features/settings/SettingsDialog";
import { useTauriEvent } from "./hooks/use-tauri";
import { useWorkspaceStore } from "./stores/workspace-store";
import { open } from "@tauri-apps/plugin-dialog";

export function App() {
  const layoutMode = useAppStore((s) => s.layoutMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const toggleSettings = useAppStore((s) => s.toggleSettings);

  const showSidebar = layoutMode !== "focus";
  const gridColumns = GRID_COLUMNS[layoutMode];

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + , → Open Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        toggleSettings();
      }
      // Cmd/Ctrl + S → Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        useEditorStore.getState().saveFile();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSettings]);

  // Tauri menu events
  const handleMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case "open-folder":
          useWorkspaceStore.getState().openFolderDialog();
          break;
        case "save":
          useEditorStore.getState().saveFile();
          break;
        case "settings":
          openSettings();
          break;
      }
    },
    [openSettings]
  );

  useTauriEvent("menu-action", handleMenuAction);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TitleBar />

      <div
        className="flex-1 overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gridTemplateRows: "1fr",
          transition: "grid-template-columns 200ms ease",
        }}
      >
        {showSidebar && <Sidebar />}
        <Editor />
        {layoutMode === "reading" && <DocumentOutline />}
      </div>

      <StatusBar />
      <SettingsDialog />
    </div>
  );
}
