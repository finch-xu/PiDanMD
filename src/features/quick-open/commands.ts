import { useEditorStore } from "~/stores/editor-store";
import { useAppStore } from "~/stores/app-store";
import { useWorkspaceStore } from "~/stores/workspace-store";
import { useSettingsStore } from "~/stores/settings-store";
import { useWritingModeStore } from "~/features/writing-modes";
import { useUpdaterStore } from "~/features/updater/store";
import type { PaletteItem } from "./types";

// ── PiDanMD v1.0 命令注册表 ──
//
// 所有可被 ⌘K 命令面板发现和执行的"动作"集中在这里注册。
// 这是用户对抗"过度极简"的发现性保险——任何砍掉的 UI 入口都
// 必须在这里有一个对应命令，不然用户找不到。

export function buildCommands(): PaletteItem[] {
  const editor = useEditorStore.getState();
  const app = useAppStore.getState();
  const workspace = useWorkspaceStore.getState();
  const settings = useSettingsStore.getState();
  const writing = useWritingModeStore.getState();

  return [
    // ── 文件 ──
    {
      id: "file.open-folder",
      title: "打开文件夹",
      hint: "选择 workspace",
      keywords: "open folder workspace",
      run: () => workspace.openFolderDialog(),
    },
    {
      id: "file.save",
      title: "保存文件",
      hint: "⌘S",
      keywords: "save",
      run: () => editor.saveFile(),
    },
    // ── 编辑模式 ──
    {
      id: "editor.mode-wysiwyg",
      title: "切换到所见即所得模式",
      keywords: "wysiwyg tiptap",
      run: () => editor.setEditorMode("wysiwyg"),
    },
    {
      id: "editor.mode-source",
      title: "切换到源码模式",
      keywords: "source code raw",
      run: () => editor.setEditorMode("source"),
    },
    {
      id: "editor.mode-preview",
      title: "切换到预览模式",
      keywords: "preview render",
      run: () => editor.setEditorMode("preview"),
    },
    // ── 写作模式 ──
    {
      id: "writing.typewriter",
      title: writing.typewriter ? "关闭打字机模式" : "开启打字机模式",
      hint: "⌘⇧T",
      keywords: "typewriter center 打字机",
      run: () => writing.toggleTypewriter(),
    },
    {
      id: "writing.focus-paragraph",
      title: writing.focusParagraph ? "关闭段落聚焦" : "开启段落聚焦",
      hint: "⌘⇧F",
      keywords: "focus paragraph dim 聚焦",
      run: () => writing.toggleFocusParagraph(),
    },
    {
      id: "writing.fullscreen",
      title: app.isFullscreen ? "退出沉浸全屏" : "进入沉浸全屏",
      hint: "F11",
      keywords: "fullscreen immersive 全屏",
      run: () => app.toggleFullscreen(),
    },
    // ── 布局 ──
    {
      id: "layout.toggle-sidebar",
      title: app.layoutMode === "focus" ? "显示文件树" : "隐藏文件树",
      hint: "⌘B",
      keywords: "sidebar toggle 侧栏",
      run: () => app.setLayoutMode(app.layoutMode === "focus" ? "files" : "focus"),
    },
    {
      id: "layout.reading",
      title: "进入阅读模式（带大纲）",
      keywords: "reading outline 大纲",
      run: () => app.setLayoutMode("reading"),
    },
    // ── 主题 ──
    {
      id: "appearance.light",
      title: "切换到亮色模式",
      keywords: "light theme 亮色",
      run: () => settings.setAppearance("light"),
    },
    {
      id: "appearance.dark",
      title: "切换到暗色模式",
      keywords: "dark theme 暗色",
      run: () => settings.setAppearance("dark"),
    },
    {
      id: "appearance.system",
      title: "跟随系统外观",
      keywords: "system theme auto 系统",
      run: () => settings.setAppearance("system"),
    },
    // ── 设置 ──
    {
      id: "settings.open",
      title: "打开设置",
      hint: "⌘,",
      keywords: "settings preferences 设置",
      run: () => app.openSettings(),
    },
    {
      id: "app.check-update",
      title: "检查更新",
      keywords: "update upgrade 更新 升级",
      run: () => useUpdaterStore.getState().requestCheck(),
    },
    {
      id: "editor.format",
      title: "格式化 Markdown",
      keywords: "format prettier 格式化",
      run: async () => {
        const editor = useEditorStore.getState();
        if (!editor.content) return;
        const { formatMarkdown } = await import("~/lib/format-markdown");
        try {
          editor.setContent(await formatMarkdown(editor.content));
        } catch (e) {
          console.error("Format failed:", e);
        }
      },
    },
  ];
}
