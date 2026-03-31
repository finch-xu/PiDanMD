import { useState, useRef, useEffect, useCallback } from "react";
import { useWorkspaceStore, type FileNode } from "~/stores/workspace-store";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tooltip } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import {
  FolderOpen,
  FilePlus,
  Search,
  ChevronRight,
  FileText,
  Folder,
  Trash2,
  Pencil,
} from "lucide-react";

export function Sidebar() {
  const t = useT();
  const tree = useWorkspaceStore((s) => s.tree);
  const workspacePath = useWorkspaceStore((s) => s.workspacePath);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery);
  const openFolderDialog = useWorkspaceStore((s) => s.openFolderDialog);
  const startCreatingFile = useWorkspaceStore((s) => s.startCreatingFile);
  const creatingInDir = useWorkspaceStore((s) => s.creatingInDir);

  const folderName = workspacePath?.split("/").pop() ?? t("workspaceNotOpened");

  return (
    <div className="flex h-full flex-col overflow-hidden border-r bg-sidebar">
      {/* Header */}
      <div className="flex h-11 items-center justify-between border-b px-3">
        <span className="truncate text-sm font-medium text-sidebar-foreground">
          {folderName}
        </span>
        <div className="flex items-center gap-0.5">
          {workspacePath && (
            <Tooltip content={t("newFile")}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => startCreatingFile(workspacePath)}
              >
                <FilePlus className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={t("openFolder")}>
            <Button variant="ghost" size="icon-sm" onClick={openFolderDialog}>
              <FolderOpen className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="min-h-0 flex-1 px-1">
        {!workspacePath ? (
          <EmptyState />
        ) : searchQuery.trim() ? (
          <SearchResults />
        ) : (
          <div className="py-1">
            {tree.map((node) => (
              <FileTreeNode key={node.path} node={node} depth={0} />
            ))}
            {creatingInDir === workspacePath && (
              <NewFileInput dir={workspacePath} depth={0} />
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function EmptyState() {
  const t = useT();
  const openFolderDialog = useWorkspaceStore((s) => s.openFolderDialog);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
      <FolderOpen className="h-10 w-10 opacity-30" />
      <p className="text-xs">{t("openFolderToStart")}</p>
      <Button variant="outline" size="sm" onClick={openFolderDialog}>
        {t("openFolder")}
      </Button>
    </div>
  );
}

function SearchResults() {
  const t = useT();
  const tree = useWorkspaceStore((s) => s.tree);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const selectedFile = useWorkspaceStore((s) => s.selectedFile);
  const selectFile = useWorkspaceStore((s) => s.selectFile);
  const loadFile = useEditorStore((s) => s.loadFile);

  const q = searchQuery.toLowerCase();
  const allFiles = collectAllMd(tree).filter((f) =>
    f.name.toLowerCase().includes(q)
  );

  if (allFiles.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        {t("noResults")}
      </p>
    );
  }

  return (
    <div className="py-1">
      {allFiles.map((f) => (
        <button
          key={f.path}
          onClick={() => {
            selectFile(f.path);
            loadFile(f.path);
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
            selectedFile === f.path
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          )}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{f.name}</span>
        </button>
      ))}
    </div>
  );
}

function collectAllMd(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const n of nodes) {
    if (!n.isDirectory && n.name.endsWith(".md")) result.push(n);
    if (n.children) result.push(...collectAllMd(n.children));
  }
  return result;
}

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const selectedFile = useWorkspaceStore((s) => s.selectedFile);
  const selectFile = useWorkspaceStore((s) => s.selectFile);
  const toggleFolder = useWorkspaceStore((s) => s.toggleFolder);
  const loadFile = useEditorStore((s) => s.loadFile);
  const startCreatingFile = useWorkspaceStore((s) => s.startCreatingFile);
  const creatingInDir = useWorkspaceStore((s) => s.creatingInDir);
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const renameNode = useWorkspaceStore((s) => s.renameNode);

  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);

  const handleClick = () => {
    if (node.isDirectory) {
      toggleFolder(node.path);
    } else {
      selectFile(node.path);
      loadFile(node.path);
    }
  };

  const handleRename = useCallback(async () => {
    if (renameValue.trim() && renameValue !== node.name) {
      await renameNode(node.path, renameValue.trim());
    }
    setIsRenaming(false);
  }, [renameValue, node.name, node.path, renameNode]);

  if (isRenaming) {
    return (
      <div style={{ paddingLeft: `${depth * 16 + 8}px` }} className="py-0.5">
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setIsRenaming(false);
          }}
          className="w-full rounded border border-ring bg-background px-1.5 py-0.5 text-xs outline-none"
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs cursor-pointer transition-colors",
          selectedFile === node.path
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              className={cn(
                "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                node.isExpanded && "rotate-90"
              )}
            />
            <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate flex-1">{node.name}</span>

        {showActions && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenameValue(node.name);
                setIsRenaming(true);
              }}
              className="rounded p-0.5 hover:bg-accent"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.path, node.isDirectory);
              }}
              className="rounded p-0.5 hover:bg-destructive/20 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {node.isDirectory && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
          {creatingInDir === node.path && (
            <NewFileInput dir={node.path} depth={depth + 1} />
          )}
        </div>
      )}
    </>
  );
}

function NewFileInput({ dir, depth }: { dir: string; depth: number }) {
  const [value, setValue] = useState("");
  const confirmCreatingFile = useWorkspaceStore((s) => s.confirmCreatingFile);
  const cancelCreatingFile = useWorkspaceStore((s) => s.cancelCreatingFile);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    if (value.trim()) {
      confirmCreatingFile(value.trim());
    } else {
      cancelCreatingFile();
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 16 + 8}px` }} className="py-0.5 pr-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
          if (e.key === "Escape") cancelCreatingFile();
        }}
        placeholder="filename.md"
        className="w-full rounded border border-ring bg-background px-1.5 py-0.5 text-xs outline-none"
      />
    </div>
  );
}
