import { useCallback } from "react";
import { useAppStore } from "~/stores/app-store";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { IconButton, Divider } from "~/components/ui/icon-button";
import { usePaletteStore } from "~/features/quick-open";
import { formatMarkdown } from "~/lib/format-markdown";
import { isMac } from "~/lib/utils";
import {
  Settings,
  PanelLeft,
  Maximize2,
  Minimize2,
  WandSparkles,
  FileCode,
  Eye,
  Type,
  Command,
} from "lucide-react";
import { cn } from "~/lib/utils";

// 平台留白：给原生窗口控件留位置（macOS 流量灯 / Windows 三连按钮）
const TRAFFIC_LIGHT_WIDTH = 78;
const WINDOWS_CONTROLS_WIDTH = 138;

// 编辑模式循环：[当前模式, 图标, 提示 i18n key（提示的是下一个模式）]
const MODE_CYCLE = [
  ["wysiwyg", FileCode, "sourceMode"],
  ["source", Eye, "previewMode"],
  ["preview", Type, "wysiwygMode"],
] as const;

const MODE_LOOKUP = Object.fromEntries(
  MODE_CYCLE.map(([mode, icon, hintKey]) => [mode, { icon, hintKey }])
) as Record<(typeof MODE_CYCLE)[number][0], { icon: typeof FileCode; hintKey: string }>;

export function TitleBar() {
  const t = useT();
  const layoutMode = useAppStore((s) => s.layoutMode);
  const setLayoutMode = useAppStore((s) => s.setLayoutMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const isFullscreen = useAppStore((s) => s.isFullscreen);
  const toggleFullscreen = useAppStore((s) => s.toggleFullscreen);
  const isDirty = useEditorStore((s) => s.isDirty);
  const filePath = useEditorStore((s) => s.filePath);
  const editorMode = useEditorStore((s) => s.editorMode);
  const toggleEditorMode = useEditorStore((s) => s.toggleEditorMode);
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const showPalette = usePaletteStore((s) => s.show);

  const fileName = filePath ? filePath.split(/[/\\]/).pop() : null;
  const { icon: ModeIcon, hintKey: modeHintKey } = MODE_LOOKUP[editorMode];

  const handleFormat = useCallback(async () => {
    if (!content) return;
    try {
      const formatted = await formatMarkdown(content);
      setContent(formatted);
    } catch (e) {
      console.error("Format failed:", e);
    }
  }, [content, setContent]);

  const leftSpacerWidth = isMac ? TRAFFIC_LIGHT_WIDTH : 0;
  const rightSpacerWidth = isMac ? 0 : WINDOWS_CONTROLS_WIDTH;

  return (
    <div
      data-tauri-drag-region
      className={cn(
        "flex h-10 items-center select-none border-b border-border/60",
        "bg-background/80 backdrop-blur-md"
      )}
    >
      {/* 左侧：平台 spacer + 文件名（左对齐）*/}
      <div
        data-tauri-drag-region
        className="shrink-0"
        style={{ width: leftSpacerWidth }}
      />
      <div
        data-tauri-drag-region
        className="flex-1 min-w-0 flex items-center px-3"
      >
        {fileName ? (
          <span
            className={cn(
              "truncate text-sm text-muted-foreground",
              isDirty && "italic"
            )}
            title={filePath ?? undefined}
          >
            {fileName}
            {isDirty && " ·"}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/40">皮蛋记</span>
        )}
      </div>

      {/* 右侧：动作按钮 */}
      <div className="flex items-center gap-0.5 pr-2">
        {filePath && (
          <>
            <IconButton label={t("formatMarkdown")} tooltipSide="bottom" onClick={handleFormat}>
              <WandSparkles className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label={t(modeHintKey)} tooltipSide="bottom" onClick={toggleEditorMode}>
              <ModeIcon className="h-3.5 w-3.5" />
            </IconButton>
            <Divider />
          </>
        )}
        <IconButton
          label={layoutMode === "focus" ? "显示文件树 ⌘B" : "隐藏文件树 ⌘B"}
          tooltipSide="bottom"
          active={layoutMode !== "focus"}
          onClick={() => setLayoutMode(layoutMode === "focus" ? "files" : "focus")}
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          label={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
          tooltipSide="bottom"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </IconButton>
        <IconButton label="命令面板 ⌘K" tooltipSide="bottom" onClick={() => showPalette("command")}>
          <Command className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label={t("settings")} tooltipSide="bottom" onClick={openSettings}>
          <Settings className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      {/* 右侧 spacer：Windows 给原生窗口控件让位 */}
      <div
        data-tauri-drag-region
        className="shrink-0"
        style={{ width: rightSpacerWidth }}
      />
    </div>
  );
}
