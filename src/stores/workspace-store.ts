import { create } from "zustand";
import {
  listDirectory,
  getDefaultStorageDir,
  createDirectory,
  renameEntry,
  deleteEntry,
  writeFile,
  type FileEntry,
} from "~/lib/tauri";
import { open } from "@tauri-apps/plugin-dialog";

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  modified?: number;
  title?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface WorkspaceState {
  tree: FileNode[];
  selectedFile: string | null;
  workspacePath: string | null;
  searchQuery: string;
  creatingInDir: string | null;

  openWorkspace: (path: string) => Promise<void>;
  initWorkspace: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  toggleFolder: (path: string) => Promise<void>;
  selectFile: (path: string) => void;
  setSearchQuery: (query: string) => void;
  openFolderDialog: () => Promise<void>;

  startCreatingFile: (dir: string) => void;
  confirmCreatingFile: (name: string) => Promise<void>;
  cancelCreatingFile: () => void;
  renameNode: (oldPath: string, newName: string) => Promise<void>;
  deleteNode: (path: string, isDirectory: boolean) => Promise<void>;
}

function entriesToNodes(entries: FileEntry[]): FileNode[] {
  return entries
    .map((e) => ({
      name: e.name,
      path: e.path,
      isDirectory: e.is_directory,
      modified: e.modified,
      children: e.is_directory ? undefined : undefined,
      isExpanded: false,
    }))
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

async function loadChildren(path: string): Promise<FileNode[]> {
  const entries = await listDirectory(path);
  return entriesToNodes(entries);
}

function updateNodeInTree(
  tree: FileNode[],
  path: string,
  updater: (node: FileNode) => FileNode
): FileNode[] {
  return tree.map((node) => {
    if (node.path === path) return updater(node);
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, path, updater) };
    }
    return node;
  });
}

function collectMarkdownFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (!node.isDirectory && node.name.endsWith(".md")) {
      result.push(node);
    }
    if (node.children) {
      result.push(...collectMarkdownFiles(node.children));
    }
  }
  return result;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  tree: [],
  selectedFile: null,
  workspacePath: null,
  searchQuery: "",
  creatingInDir: null,

  openWorkspace: async (path) => {
    const entries = await listDirectory(path);
    const nodes = entriesToNodes(entries);
    set({ tree: nodes, workspacePath: path, selectedFile: null, searchQuery: "" });
  },

  initWorkspace: async () => {
    try {
      const dir = await getDefaultStorageDir();
      await get().openWorkspace(dir);
    } catch (e) {
      console.error("Failed to init workspace:", e);
    }
  },

  refreshWorkspace: async () => {
    const { workspacePath } = get();
    if (!workspacePath) return;
    await get().openWorkspace(workspacePath);
  },

  toggleFolder: async (path) => {
    const { tree } = get();
    const findNode = (nodes: FileNode[]): FileNode | null => {
      for (const n of nodes) {
        if (n.path === path) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(tree);
    if (!node || !node.isDirectory) return;

    if (node.isExpanded) {
      set({
        tree: updateNodeInTree(tree, path, (n) => ({
          ...n,
          isExpanded: false,
        })),
      });
    } else {
      const children = await loadChildren(path);
      set({
        tree: updateNodeInTree(tree, path, (n) => ({
          ...n,
          isExpanded: true,
          children,
        })),
      });
    }
  },

  selectFile: (path) => set({ selectedFile: path }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  openFolderDialog: async () => {
    const selected = await open({ directory: true });
    if (selected) {
      await get().openWorkspace(selected as string);
    }
  },

  startCreatingFile: (dir) => set({ creatingInDir: dir }),

  confirmCreatingFile: async (name) => {
    const { creatingInDir } = get();
    if (!creatingInDir) return;
    const fileName = name.endsWith(".md") ? name : `${name}.md`;
    const filePath = `${creatingInDir}/${fileName}`;
    await writeFile(filePath, "");
    set({ creatingInDir: null });
    await get().refreshWorkspace();
    get().selectFile(filePath);
  },

  cancelCreatingFile: () => set({ creatingInDir: null }),

  renameNode: async (oldPath, newName) => {
    const parts = oldPath.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");
    await renameEntry(oldPath, newPath);
    await get().refreshWorkspace();
  },

  deleteNode: async (path, isDirectory) => {
    await deleteEntry(path, isDirectory);
    const { selectedFile } = get();
    if (selectedFile === path) {
      set({ selectedFile: null });
    }
    await get().refreshWorkspace();
  },

  // Helper for search
  get filteredFiles() {
    const { tree, searchQuery } = get();
    if (!searchQuery.trim()) return null;
    const all = collectMarkdownFiles(tree);
    const q = searchQuery.toLowerCase();
    return all.filter((f) => f.name.toLowerCase().includes(q));
  },
}));
