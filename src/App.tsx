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
import { useWritingModeStore } from "./features/writing-modes";
import { Palette, usePaletteStore } from "./features/quick-open";
import { UpdateBanner } from "./features/updater";
import { open } from "@tauri-apps/plugin-dialog";

export function App() {
  const layoutMode = useAppStore((s) => s.layoutMode);
  const isFullscreen = useAppStore((s) => s.isFullscreen);
  const openSettings = useAppStore((s) => s.openSettings);
  const toggleSettings = useAppStore((s) => s.toggleSettings);

  const showSidebar = layoutMode !== "focus";
  const gridColumns = GRID_COLUMNS[layoutMode];

  const toggleFullscreen = useAppStore((s) => s.toggleFullscreen);
  const setLayoutMode = useAppStore((s) => s.setLayoutMode);

  const toggleTypewriter = useWritingModeStore((s) => s.toggleTypewriter);
  const toggleFocusParagraph = useWritingModeStore((s) => s.toggleFocusParagraph);
  const showPalette = usePaletteStore((s) => s.show);

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
      // Cmd/Ctrl + B → Toggle Sidebar（focus ↔ files）
      // v1.0 默认 focus 模式无侧栏；用户随时按 Cmd+B 呼出文件树
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        const current = useAppStore.getState().layoutMode;
        setLayoutMode(current === "focus" ? "files" : "focus");
      }
      // Cmd/Ctrl + Shift + T → Toggle Typewriter Mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        toggleTypewriter();
      }
      // Cmd/Ctrl + Shift + F → Toggle Focus Paragraph Mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        toggleFocusParagraph();
      }
      // F11 → Toggle Fullscreen (immersive mode)
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      // Cmd/Ctrl + K → Command Palette
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        showPalette("command");
      }
      // Cmd/Ctrl + O → Quick Open file
      if ((e.metaKey || e.ctrlKey) && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        showPalette("file");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    toggleSettings,
    toggleFullscreen,
    setLayoutMode,
    toggleTypewriter,
    toggleFocusParagraph,
    showPalette,
  ]);

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
      {/* 沉浸全屏（F11）时隐藏标题栏，让画布占满整屏 */}
      {!isFullscreen && <TitleBar />}

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

      {!isFullscreen && <StatusBar />}
      <SettingsDialog />
      <Palette />
      <UpdateBanner />
    </div>
  );
}
