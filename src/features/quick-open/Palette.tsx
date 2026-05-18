import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { useWorkspaceStore, type FileNode } from "~/stores/workspace-store";
import { listDirectory } from "~/lib/tauri";
import { cn, shortenPath } from "~/lib/utils";
import { usePaletteStore } from "./store";
import { buildCommands } from "./commands";
import type { PaletteItem } from "./types";

// command (⌘K) 和 file (⌘O) 共用同一浮层；区别只在数据源和回车行为。

const MAX_RESULTS = 50;
const SCORE = {
  titlePrefix: 1000,
  titleContains: 500,
  hintContains: 200,
  keywordsContains: 100,
  fuzzy: 50,
} as const;

function score(item: PaletteItem, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();

  const tIdx = title.indexOf(q);
  if (tIdx === 0) return SCORE.titlePrefix;
  if (tIdx > 0) return SCORE.titleContains - tIdx;

  if ((item.hint ?? "").toLowerCase().includes(q)) return SCORE.hintContains;
  if ((item.keywords ?? "").toLowerCase().includes(q)) return SCORE.keywordsContains;

  // 模糊匹配：所有字符按顺序出现在 title 中
  let i = 0;
  for (const ch of title) {
    if (ch === q[i]) i++;
    if (i === q.length) return SCORE.fuzzy;
  }
  return 0;
}

// 跨 ⌘O 调用复用扫描结果。key = `${workspacePath}:${treeRef}`
// treeRef 用 tree 顶层引用——workspace-store 任何 tree 重建（refresh/openFolder）
// 都会产生新引用，自然命中失效。
const fileCache = new WeakMap<FileNode[], PaletteItem[]>();

async function collectAllMarkdown(nodes: FileNode[]): Promise<FileNode[]> {
  // 并发拉取所有未展开子目录（旧实现是顺序 await，子树多时延迟显著）
  const branches = await Promise.all(
    nodes.map(async (node) => {
      if (!node.isDirectory) {
        return node.name.endsWith(".md") ? [node] : [];
      }
      let children = node.children;
      if (!children) {
        try {
          const entries = await listDirectory(node.path);
          children = entries.map((e) => ({
            name: e.name,
            path: e.path,
            isDirectory: e.is_directory,
            modified: e.modified,
            isExpanded: false,
          }));
        } catch {
          children = [];
        }
      }
      return collectAllMarkdown(children);
    })
  );
  return branches.flat();
}

export function Palette() {
  const open = usePaletteStore((s) => s.open);
  const mode = usePaletteStore((s) => s.mode);
  const hide = usePaletteStore((s) => s.hide);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);

  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [files, setFiles] = useState<PaletteItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, mode]);

  // mode=file 时按需加载所有 markdown 文件（带基于 tree 引用的缓存）
  useEffect(() => {
    if (!open || mode !== "file" || !workspacePath) return;

    const tree = useWorkspaceStore.getState().tree;
    const cached = fileCache.get(tree);
    if (cached) {
      setFiles(cached);
      setLoadingFiles(false);
      return;
    }

    let cancelled = false;
    setLoadingFiles(true);
    collectAllMarkdown(tree).then((mdFiles) => {
      if (cancelled) return;
      const items: PaletteItem[] = mdFiles.map((f) => ({
        id: f.path,
        title: f.name.replace(/\.md$/i, ""),
        hint: shortenPath(f.path),
        keywords: f.path,
        run: () => useEditorStore.getState().loadFile(f.path),
      }));
      fileCache.set(tree, items);
      setFiles(items);
      setLoadingFiles(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, mode, workspacePath]);

  // 命令列表只在 mode=command 时构建（mode=file 不付出构建命令的成本）
  const items = useMemo<PaletteItem[]>(() => {
    const source = mode === "command" ? buildCommands() : files;
    return source
      .map((item) => ({ item, s: score(item, query) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS)
      .map(({ item }) => item);
  }, [mode, query, files]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = items[activeIdx];
      if (picked) {
        hide();
        Promise.resolve().then(() => picked.run());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      hide();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
      onClick={hide}
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm pidan-anim-fade" />
      <div
        className={cn(
          "relative w-full max-w-xl rounded-2xl border border-border/60 bg-popover overflow-hidden",
          "pidan-shadow-overlay pidan-anim-zoom"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <span className="text-muted-foreground text-sm">
            {mode === "command" ? "⌘" : "📄"}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKey}
            placeholder={
              mode === "command" ? "搜索命令..." : "搜索 Markdown 文件..."
            }
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {loadingFiles && mode === "file" && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              正在索引文件...
            </div>
          )}
          {!loadingFiles && items.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {mode === "command" ? "无匹配命令" : "无匹配文件"}
            </div>
          )}
          {items.map((item, idx) => (
            <button
              key={item.id}
              data-idx={idx}
              onClick={() => {
                hide();
                Promise.resolve().then(() => item.run());
              }}
              onMouseEnter={() => setActiveIdx(idx)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors duration-100",
                idx === activeIdx
                  ? "bg-accent text-accent-foreground border-l-2 pidan-border-l-brand"
                  : "border-l-2 border-l-transparent"
              )}
            >
              <span className="truncate">{item.title}</span>
              {item.hint && (
                <span className="shrink-0 text-xs text-muted-foreground/70 font-mono">
                  {item.hint}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-border/50 px-4 py-2 text-xs text-muted-foreground/70 flex items-center gap-3">
          <span>↑↓ 选择</span>
          <span>↵ 执行</span>
          <span className="ml-auto text-[10px]">{items.length} 项</span>
        </div>
      </div>
    </div>
  );
}

