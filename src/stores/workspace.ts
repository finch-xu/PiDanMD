import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { FileNode } from '~/types/file-tree';
import { listDirectory, createDirectory, getDefaultStorageDir, readFile, writeFile, openWorkspaceCommand, renameEntry, deleteEntry, type FileEntry } from '~/lib/tauri/commands';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

interface WorkspaceState {
  tree: FileNode[];
  selectedFile: string | null;
  workspacePath: string | null;
}

const [state, setState] = createStore<WorkspaceState>({
  tree: [],
  selectedFile: null,
  workspacePath: null,
});

function entriesToNodes(entries: FileEntry[]): FileNode[] {
  return entries.map((entry) => ({
    name: entry.name,
    path: entry.path,
    isDirectory: entry.is_directory,
    modified: entry.modified,
    children: undefined,
    isExpanded: false,
    isLoading: false,
  }));
}

async function loadChildrenDeep(nodes: FileNode[], depth: number): Promise<void> {
  if (depth <= 0) return;
  const dirs = nodes.filter(n => n.isDirectory);
  await Promise.all(dirs.map(async (dir) => {
    try {
      const entries = await listDirectory(dir.path);
      dir.children = entriesToNodes(entries);
      await loadChildrenDeep(dir.children, depth - 1);
    } catch {
      // 读取失败则留 children 为 undefined，toggleFolder 会在用户点击时重试
    }
  }));
}

async function loadTitles(nodes: FileNode[]) {
  await Promise.all(nodes.map(async (node) => {
    if (!node.isDirectory && node.name.endsWith('.md')) {
      try {
        const content = await readFile(node.path);
        const match = content.match(/^#\s+(.+)$/m);
        if (match) node.title = match[1];
      } catch { /* ignore read errors */ }
    }
    if (node.children) {
      await loadTitles(node.children);
    }
  }));
}

async function openWorkspace(path: string) {
  await openWorkspaceCommand(path);
  const entries = await listDirectory(path);
  const nodes = entriesToNodes(entries);
  await loadChildrenDeep(nodes, 2);
  await loadTitles(nodes);
  // Auto-expand top-level directories that contain children
  for (const node of nodes) {
    if (node.isDirectory && node.children?.length) {
      node.isExpanded = true;
    }
  }
  setState({
    tree: nodes,
    workspacePath: path,
    selectedFile: null,
  });
}

async function initWorkspace() {
  try {
    const dir = await getDefaultStorageDir();
    await openWorkspace(dir);
  } catch {
    // Silently fail if default dir unavailable
  }
}

async function refreshWorkspace() {
  const path = state.workspacePath;
  if (!path) return;

  // 记住当前展开的文件夹
  const expandedPaths = new Set<string>();
  function collectExpanded(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.isDirectory && node.isExpanded) expandedPaths.add(node.path);
      if (node.children) collectExpanded(node.children);
    }
  }
  collectExpanded(state.tree);

  const entries = await listDirectory(path);
  const nodes = entriesToNodes(entries);
  await loadChildrenDeep(nodes, 2);
  await loadTitles(nodes);

  // 恢复展开状态
  function restoreExpanded(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.isDirectory && expandedPaths.has(node.path)) node.isExpanded = true;
      if (node.children) restoreExpanded(node.children);
    }
  }
  restoreExpanded(nodes);

  setState('tree', nodes);
}

async function createFolder(name: string) {
  const base = state.workspacePath;
  if (!base) return;
  const fullPath = base + '/' + name;
  await createDirectory(fullPath);
  await refreshWorkspace();
}

async function renameNode(oldPath: string, newName: string): Promise<string> {
  const parentDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
  const newPath = parentDir + '/' + newName;
  await renameEntry(oldPath, newPath);
  if (state.selectedFile === oldPath) setState('selectedFile', newPath);
  if (state.selectedFile?.startsWith(oldPath + '/')) {
    setState('selectedFile', state.selectedFile.replace(oldPath, newPath));
  }
  await refreshWorkspace();
  return newPath;
}

async function deleteNode(path: string, isDirectory: boolean) {
  await deleteEntry(path, isDirectory);
  if (state.selectedFile === path) setState('selectedFile', null);
  if (isDirectory && state.selectedFile?.startsWith(path + '/')) {
    setState('selectedFile', null);
  }
  await refreshWorkspace();
}

async function toggleFolder(path: string) {
  const node = findNode(state.tree, path);
  if (!node || !node.isDirectory) return;

  if (node.isExpanded) {
    updateNodeAtPath(path, () => ({ isExpanded: false }));
  } else if (node.children === undefined) {
    updateNodeAtPath(path, () => ({ isLoading: true }));
    try {
      const entries = await listDirectory(path);
      const children = entriesToNodes(entries);
      await loadTitles(children);
      updateNodeAtPath(path, () => ({ children, isLoading: false, isExpanded: true }));
    } catch {
      updateNodeAtPath(path, () => ({ isLoading: false }));
    }
  } else {
    updateNodeAtPath(path, () => ({ isExpanded: true }));
  }
}

function selectFile(path: string) {
  setState('selectedFile', path);
  // Auto-highlight parent folder
  const parent = findParentFolder(path);
  if (parent) {
    setSelectedFolder(parent);
  }
}

const [selectedFolder, setSelectedFolder] = createSignal<string | null>(null);

const [searchQuery, setSearchQuery] = createSignal('');

function searchMarkdownFiles(query: string, allFiles: FileNode[]): FileNode[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return allFiles.filter((f) => {
    const nameMatch = f.name.toLowerCase().includes(q);
    const titleMatch = f.title?.toLowerCase().includes(q);
    return nameMatch || titleMatch;
  });
}

function selectFolder(path: string | null) {
  setSelectedFolder(path);
}

function findParentFolder(filePath: string): string | null {
  for (const node of state.tree) {
    if (node.isDirectory && filePath.startsWith(node.path + '/')) {
      return node.path;
    }
  }
  return null;
}

function collectMarkdownFiles(folderPath?: string | null): FileNode[] {
  const files: FileNode[] = [];

  function collect(nodes: FileNode[]) {
    for (const node of nodes) {
      if (!node.isDirectory && node.name.endsWith('.md')) {
        files.push(node);
      }
      if (node.children) {
        collect(node.children);
      }
    }
  }

  if (folderPath) {
    const folder = findNode(state.tree, folderPath);
    if (folder?.children) {
      collect(folder.children);
    }
  } else {
    collect(state.tree);
  }

  return files.sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0));
}

interface FileGroup {
  folderName: string;
  folderPath: string;
  files: FileNode[];
}

function collectMarkdownFilesByGroup(): FileGroup[] {
  const wsPath = state.workspacePath;
  if (!wsPath) return [];

  const groupMap = new Map<string, FileGroup>();

  function collect(nodes: FileNode[], parentPath: string) {
    for (const node of nodes) {
      if (!node.isDirectory && node.name.endsWith('.md')) {
        let group = groupMap.get(parentPath);
        if (!group) {
          const relative = parentPath === wsPath
            ? parentPath.split('/').pop() || ''
            : parentPath.slice(wsPath.length + 1);
          group = { folderName: relative, folderPath: parentPath, files: [] };
          groupMap.set(parentPath, group);
        }
        group.files.push(node);
      }
      if (node.isDirectory && node.children) {
        collect(node.children, node.path);
      }
    }
  }

  collect(state.tree, wsPath);

  // Sort files within each group by modified desc
  for (const group of groupMap.values()) {
    group.files.sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0));
  }

  const groups = Array.from(groupMap.values());

  // Root group first, then by newest file in group desc
  groups.sort((a, b) => {
    if (a.folderPath === wsPath) return -1;
    if (b.folderPath === wsPath) return 1;
    const aMax = a.files[0]?.modified ?? 0;
    const bMax = b.files[0]?.modified ?? 0;
    return bMax - aMax;
  });

  return groups;
}

function findNode(nodes: FileNode[], path: string): FileNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

function updateNodeAtPath(
  path: string,
  updater: (node: FileNode) => Partial<FileNode>,
) {
  setState(
    'tree',
    (tree) => updateTreeNodes(tree, path, updater),
  );
}

function updateTreeNodes(
  nodes: FileNode[],
  path: string,
  updater: (node: FileNode) => Partial<FileNode>,
): FileNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return { ...node, ...updater(node) };
    }
    if (node.children) {
      return { ...node, children: updateTreeNodes(node.children, path, updater) };
    }
    return node;
  });
}

// ── 内联创建文件 ──

const [creatingInDir, setCreatingInDir] = createSignal<string | null>(null);

function getCreationTargetDir(): string | null {
  const ws = state.workspacePath;
  if (!ws) return null;
  const sel = state.selectedFile;
  if (sel) return sel.substring(0, sel.lastIndexOf('/'));
  return ws;
}

function startCreatingFile() {
  const dir = getCreationTargetDir();
  if (!dir) return;
  const node = findNode(state.tree, dir);
  if (node && node.isDirectory && !node.isExpanded) {
    toggleFolder(dir);
  }
  setCreatingInDir(dir);
}

function cancelCreatingFile() {
  setCreatingInDir(null);
}

async function confirmCreatingFile(name: string): Promise<string | null> {
  const dir = creatingInDir();
  if (!dir) return null;

  const trimmed = name.trim();
  if (!trimmed) {
    setCreatingInDir(null);
    return null;
  }

  const fileName = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
  const fullPath = `${dir}/${fileName}`;

  const parent = findNode(state.tree, dir);
  const siblings = dir === state.workspacePath ? state.tree : parent?.children;
  if (siblings?.some(n => n.name === fileName)) {
    setCreatingInDir(null);
    return null;
  }

  try {
    await writeFile(fullPath, '');
    await refreshWorkspace();
    selectFile(fullPath);
    setCreatingInDir(null);
    return fullPath;
  } catch (e) {
    console.error('[workspace] Failed to create file:', e);
    setCreatingInDir(null);
    return null;
  }
}

async function openSingleFile(): Promise<string | null> {
  try {
    const selected = await openDialog({
      directory: false,
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    if (!selected) return null;

    // If the file is outside the current workspace, switch workspace to its parent
    const parentDir = selected.substring(0, selected.lastIndexOf('/'));
    if (!state.workspacePath || !selected.startsWith(state.workspacePath + '/')) {
      await openWorkspace(parentDir);
    }

    return selected;
  } catch (e) {
    console.error('[workspace] Failed to open file dialog:', e);
    return null;
  }
}

export {
  state as workspaceState,
  openWorkspace,
  initWorkspace,
  refreshWorkspace,
  createFolder,
  renameNode,
  deleteNode,
  findNode,
  toggleFolder,
  selectFile,
  selectedFolder,
  selectFolder,
  collectMarkdownFiles,
  collectMarkdownFilesByGroup,
  openSingleFile,
  searchQuery,
  setSearchQuery,
  searchMarkdownFiles,
  creatingInDir,
  startCreatingFile,
  cancelCreatingFile,
  confirmCreatingFile,
};
export type { FileGroup };
