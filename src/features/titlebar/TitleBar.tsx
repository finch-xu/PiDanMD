import { useCallback } from "react";
import { useAppStore } from "~/stores/app-store";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import {
  Settings,
  PanelLeft,
  BookOpen,
  Maximize2,
  WandSparkles,
  FileCode,
  Eye,
} from "lucide-react";
import { cn } from "~/lib/utils";

type LayoutMode = "files" | "reading" | "focus";

const layoutIcons: Record<LayoutMode, React.ComponentType<{ className?: string }>> = {
  files: PanelLeft,
  reading: BookOpen,
  focus: Maximize2,
};

const isMac = navigator.userAgent.includes("Mac");

async function formatWithPrettier(source: string): Promise<string> {
  const prettier = await import("prettier/standalone");
  const markdownPlugin = await import("prettier/plugins/markdown");
  return prettier.format(source, {
    parser: "markdown",
    plugins: [markdownPlugin.default ?? markdownPlugin],
  });
}

export function TitleBar() {
  const t = useT();
  const layoutMode = useAppStore((s) => s.layoutMode);
  const cycleLayoutMode = useAppStore((s) => s.cycleLayoutMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const isDirty = useEditorStore((s) => s.isDirty);
  const filePath = useEditorStore((s) => s.filePath);
  const editorMode = useEditorStore((s) => s.editorMode);
  const toggleEditorMode = useEditorStore((s) => s.toggleEditorMode);
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);

  const LayoutIcon = layoutIcons[layoutMode];
  const fileName = filePath ? filePath.split(/[/\\]/).pop() : null;

  const ModeIcon = editorMode === "wysiwyg" ? FileCode : Eye;
  const modeTooltip = editorMode === "wysiwyg" ? t("sourceMode") : t("wysiwygMode");

  const handleFormat = useCallback(async () => {
    if (!content) return;
    try {
      const formatted = await formatWithPrettier(content);
      setContent(formatted);
    } catch (e) {
      console.error("Format failed:", e);
    }
  }, [content, setContent]);

  return (
    <div
      data-tauri-drag-region
      className="flex h-11 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-3 select-none"
    >
      {/* Left: macOS traffic light spacer / Windows: nothing */}
      <div data-tauri-drag-region className="flex items-center gap-1 min-w-[80px]">
        {isMac && <div className="w-[70px]" />}
      </div>

      {/* Center: File name */}
      <div data-tauri-drag-region className="flex items-center gap-2 text-sm text-muted-foreground">
        {fileName && (
          <span className={cn("truncate max-w-[300px]", isDirty && "italic")}>
            {fileName}
            {isDirty && " *"}
          </span>
        )}
      </div>

      {/* Right: Actions + Windows system button spacer */}
      <div className="flex items-center gap-0.5">
        {filePath && (
          <>
            <Tooltip content={t("formatMarkdown")}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleFormat}
              >
                <WandSparkles className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content={modeTooltip}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleEditorMode}
              >
                <ModeIcon className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />
          </>
        )}

        <Tooltip content={t("layout")}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={cycleLayoutMode}
          >
            <LayoutIcon className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content={t("settings")}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={openSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>

        {/* Windows/Linux: reserve space for native window controls (min/max/close) */}
        {!isMac && <div className="w-[140px]" />}
      </div>
    </div>
  );
}
