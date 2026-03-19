import { For, Show, createMemo, createSignal, onMount } from 'solid-js';
import { fileListVisible } from '~/stores/layout';
import {
  workspaceState,
  openWorkspace,
  collectMarkdownFiles,
  selectFile,
  toggleFolder,
  renameNode,
  deleteNode,
  searchQuery,
  setSearchQuery,
  searchMarkdownFiles,
  creatingInDir,
  startCreatingFile,
  cancelCreatingFile,
  confirmCreatingFile,
} from '~/stores/workspace';
import type { FileNode } from '~/types/file-tree';
import { loadFile, filePath as editorFilePath, clearEditor, setFilePath } from '~/stores/editor';
import { open } from '@tauri-apps/plugin-dialog';
import { t, tWith, noteCount, locale } from '~/lib/i18n';
import FileText from 'lucide-solid/icons/file-text';
import FilePlus from 'lucide-solid/icons/file-plus';
import FolderOpen from 'lucide-solid/icons/folder-open';
import ChevronDown from 'lucide-solid/icons/chevron-down';
import ChevronRight from 'lucide-solid/icons/chevron-right';
import Folder from 'lucide-solid/icons/folder';
import Search from 'lucide-solid/icons/search';
import X from 'lucide-solid/icons/x';
import { ContextMenu } from '~/components/sidebar/ContextMenu';

// --- Helpers ---

function formatDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const l = locale();
  const time = d.toLocaleTimeString(l, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  if (l === 'en-US') return `${d.toLocaleDateString('en-CA')} ${time}`;
  const date = d.toLocaleDateString(l, { year: 'numeric', month: 'long', day: 'numeric' });
  return `${date} ${time}`;
}

function countMdFiles(nodes?: FileNode[]): number {
  if (!nodes) return 0;
  let count = 0;
  for (const n of nodes) {
    if (!n.isDirectory && n.name.endsWith('.md')) count++;
    if (n.children) count += countMdFiles(n.children);
  }
  return count;
}

function hasMdFiles(node: FileNode): boolean {
  if (!node.isDirectory) return node.name.endsWith('.md');
  if (!node.children) return false;
  return node.children.some(hasMdFiles);
}

function sortedChildren(nodes?: FileNode[]): FileNode[] {
  if (!nodes) return [];
  const dirs = nodes.filter((n) => n.isDirectory).sort((a, b) => a.name.localeCompare(b.name));
  const files = nodes.filter((n) => !n.isDirectory).sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0));
  return [...dirs, ...files];
}

// --- Inline new file input ---

function NewFileInput(props: { depth: number }) {
  let inputRef: HTMLInputElement | undefined;
  let submitted = false;

  const handleConfirm = async () => {
    if (submitted) return;
    submitted = true;
    const val = inputRef?.value ?? '';
    const path = await confirmCreatingFile(val);
    if (path) await loadFile(path, 'edit');
  };

  onMount(() => inputRef?.focus());

  return (
    <div
      style={{ 'padding-left': `${props.depth * 16 + 8}px` }}
      class="flex items-center gap-0.5 px-2 py-1"
    >
      <FileText size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />
      <input
        ref={inputRef}
        class="flex-1 min-w-0 text-sm bg-transparent border-b border-overlay1 focus:border-blue focus:outline-none text-text placeholder-overlay0"
        placeholder="filename"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm();
          if (e.key === 'Escape') cancelCreatingFile();
        }}
        onBlur={handleConfirm}
      />
      <span class="text-sm text-overlay0 shrink-0">.md</span>
    </div>
  );
}

// --- Tree components ---

function TreeFileItem(props: {
  file: FileNode;
  depth: number;
  isActive: boolean;
  onClick: (path: string) => void;
  onContextMenu: (e: MouseEvent, node: FileNode) => void;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
}) {
  const displayName = () => props.file.name.replace(/\.md$/, '');
  const displayTitle = () => props.file.title || displayName();

  return (
    <Show
      when={!props.isRenaming}
      fallback={
        <div
          class="w-full px-2 py-1.5"
          style={{ 'padding-left': `${props.depth * 16 + 8}px` }}
        >
          <input
            ref={(el) => setTimeout(() => el.focus(), 0)}
            class="w-full text-sm rounded px-1 py-0.5 outline-none"
            style={{
              background: 'var(--ctp-surface1)',
              color: 'var(--ctp-text)',
              border: '1px solid var(--ctp-overlay0)',
            }}
            value={props.renameValue}
            onInput={(e) => props.onRenameChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') props.onRenameConfirm();
              if (e.key === 'Escape') props.onRenameCancel();
            }}
            onBlur={() => props.onRenameConfirm()}
          />
        </div>
      }
    >
      <button
        class="w-full text-left rounded-md px-2 py-1.5 transition-colors focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none file-item"
        style={{
          'padding-left': `${props.depth * 16 + 8}px`,
          background: props.isActive
            ? 'color-mix(in srgb, var(--ctp-overlay1) 15%, transparent)'
            : 'transparent',
        }}
        classList={{ 'file-item-active': props.isActive }}
        onClick={() => props.onClick(props.file.path)}
        onContextMenu={(e) => props.onContextMenu(e, props.file)}
      >
        <div
          class="text-sm truncate font-medium"
          style={{ color: props.isActive ? 'var(--ctp-text)' : 'var(--ctp-subtext0)' }}
        >
          {displayTitle()}
        </div>
        <div class="text-xs truncate" style={{ color: 'var(--ctp-overlay0)' }}>
          {formatDate(props.file.modified)}
        </div>
      </button>
    </Show>
  );
}

function TreeFolderItem(props: {
  node: FileNode;
  depth: number;
  onToggle: () => void;
  onContextMenu: (e: MouseEvent, node: FileNode) => void;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
}) {
  const mdCount = () => countMdFiles(props.node.children);

  return (
    <Show
      when={!props.isRenaming}
      fallback={
        <div
          class="w-full px-2 py-1 flex items-center gap-1"
          style={{ 'padding-left': `${props.depth * 16 + 8}px` }}
        >
          <Folder size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />
          <input
            ref={(el) => setTimeout(() => el.focus(), 0)}
            class="flex-1 text-xs font-semibold rounded px-1 py-0.5 outline-none min-w-0"
            style={{
              background: 'var(--ctp-surface1)',
              color: 'var(--ctp-text)',
              border: '1px solid var(--ctp-overlay0)',
            }}
            value={props.renameValue}
            onInput={(e) => props.onRenameChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') props.onRenameConfirm();
              if (e.key === 'Escape') props.onRenameCancel();
            }}
            onBlur={() => props.onRenameConfirm()}
          />
        </div>
      }
    >
      <button
        class="w-full text-left rounded-md px-2 py-1 flex items-center gap-1 select-none hover:bg-surface0/50 transition-colors"
        style={{ 'padding-left': `${props.depth * 16 + 8}px` }}
        onClick={props.onToggle}
        onContextMenu={(e) => props.onContextMenu(e, props.node)}
      >
        <Show when={props.node.isExpanded} fallback={<ChevronRight size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />}>
          <ChevronDown size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />
        </Show>
        <Folder size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />
        <span class="text-xs font-semibold truncate" style={{ color: 'var(--ctp-subtext1)' }}>
          {props.node.name}
        </span>
        <span class="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--ctp-overlay0)' }}>
          {mdCount()}
        </span>
      </button>
    </Show>
  );
}

function TreeNode(props: {
  node: FileNode;
  depth: number;
  selectedFile: string | null;
  onFileClick: (path: string) => void;
  onContextMenu: (e: MouseEvent, node: FileNode) => void;
  renamingPath: string | null;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
}) {
  // Skip non-.md files and folders without .md descendants
  if (!hasMdFiles(props.node)) return null;

  if (!props.node.isDirectory) {
    if (!props.node.name.endsWith('.md')) return null;
    return (
      <TreeFileItem
        file={props.node}
        depth={props.depth}
        isActive={props.selectedFile === props.node.path}
        onClick={props.onFileClick}
        onContextMenu={props.onContextMenu}
        isRenaming={props.renamingPath === props.node.path}
        renameValue={props.renameValue}
        onRenameChange={props.onRenameChange}
        onRenameConfirm={props.onRenameConfirm}
        onRenameCancel={props.onRenameCancel}
      />
    );
  }

  return (
    <>
      <TreeFolderItem
        node={props.node}
        depth={props.depth}
        onToggle={() => toggleFolder(props.node.path)}
        onContextMenu={props.onContextMenu}
        isRenaming={props.renamingPath === props.node.path}
        renameValue={props.renameValue}
        onRenameChange={props.onRenameChange}
        onRenameConfirm={props.onRenameConfirm}
        onRenameCancel={props.onRenameCancel}
      />
      <Show when={props.node.isExpanded}>
        <Show when={props.node.isLoading}>
          <div
            class="text-xs py-1"
            style={{ 'padding-left': `${(props.depth + 1) * 16 + 8}px`, color: 'var(--ctp-overlay0)' }}
          >
            ...
          </div>
        </Show>
        <div style={{ 'margin-left': `${props.depth * 16 + 14}px`, 'border-left': '1px solid var(--ctp-surface0)' }}>
          <For each={sortedChildren(props.node.children)}>
            {(child) => (
              <TreeNode
                node={child}
                depth={props.depth + 1}
                selectedFile={props.selectedFile}
                onFileClick={props.onFileClick}
                onContextMenu={props.onContextMenu}
                renamingPath={props.renamingPath}
                renameValue={props.renameValue}
                onRenameChange={props.onRenameChange}
                onRenameConfirm={props.onRenameConfirm}
                onRenameCancel={props.onRenameCancel}
              />
            )}
          </For>
          <Show when={creatingInDir() === props.node.path}>
            <NewFileInput depth={props.depth + 1} />
          </Show>
        </div>
      </Show>
    </>
  );
}

// --- Main component ---

export function FileListPane() {
  const [contextMenu, setContextMenu] = createSignal<{ x: number; y: number; node: FileNode } | null>(null);
  const [renamingPath, setRenamingPath] = createSignal<string | null>(null);
  const [renameValue, setRenameValue] = createSignal('');
  const [deleteTarget, setDeleteTarget] = createSignal<FileNode | null>(null);

  const handleOpen = async () => {
    try {
      const selected = await open({ directory: true });
      if (selected) {
        openWorkspace(selected);
      }
    } catch (e) {
      console.error('Failed to open folder dialog:', e);
    }
  };

  const mdFiles = createMemo(() => collectMarkdownFiles(null));
  const filteredFiles = createMemo(() => searchMarkdownFiles(searchQuery(), mdFiles()));

  const handleFileClick = (path: string) => {
    selectFile(path);
    loadFile(path);
  };

  const handleContextMenu = (e: MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleStartRename = () => {
    const menu = contextMenu();
    if (!menu) return;
    setRenamingPath(menu.node.path);
    setRenameValue(menu.node.name);
  };

  const handleRenameConfirm = async () => {
    const path = renamingPath();
    if (!path) return;
    const newName = renameValue().trim();
    if (!newName || newName === path.split('/').pop()) {
      setRenamingPath(null);
      return;
    }
    try {
      const currentEditorPath = editorFilePath();
      const newPath = await renameNode(path, newName);
      // Sync editor state
      if (currentEditorPath === path) {
        setFilePath(newPath);
      } else if (currentEditorPath?.startsWith(path + '/')) {
        setFilePath(newPath + currentEditorPath.slice(path.length));
      }
    } catch (e) {
      console.error('Failed to rename:', e);
    }
    setRenamingPath(null);
  };

  const handleRenameCancel = () => {
    setRenamingPath(null);
  };

  const handleStartDelete = () => {
    const menu = contextMenu();
    if (!menu) return;
    setDeleteTarget(menu.node);
  };

  const handleDeleteConfirm = async () => {
    const target = deleteTarget();
    if (!target) return;
    try {
      const currentEditorPath = editorFilePath();
      const shouldClear = currentEditorPath === target.path
        || (target.isDirectory && currentEditorPath?.startsWith(target.path + '/'));
      await deleteNode(target.path, target.isDirectory);
      if (shouldClear) clearEditor();
    } catch (e) {
      console.error('Failed to delete:', e);
    }
    setDeleteTarget(null);
  };

  return (
    <div
      class="overflow-hidden flex flex-col"
      style={{
        'min-width': '0',
        'padding-left': '6px',
        background: 'var(--ctp-base)',
        'border-right': '1px solid var(--ctp-surface0)',
        opacity: fileListVisible() ? '1' : '0',
        transition: 'opacity 200ms ease',
      }}
    >
      {/* Action bar: search + buttons */}
      <div class="px-2 py-1.5 flex items-center gap-1 select-none shrink-0">
        <Show
          when={workspaceState.workspacePath}
          fallback={<span class="text-xs text-overlay0 flex-1">{t('workspaceNotOpened')}</span>}
        >
          <div
            class="flex items-center gap-1.5 px-2 py-1 rounded-md flex-1 min-w-0"
            style={{ background: 'var(--ctp-surface0)' }}
          >
            <Search size={14} style={{ color: 'var(--ctp-overlay1)', 'flex-shrink': '0' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="flex-1 bg-transparent text-xs outline-none min-w-0"
              style={{ color: 'var(--ctp-text)' }}
            />
            <Show when={searchQuery()}>
              <button
                class="flex items-center justify-center rounded hover:bg-surface1/50 transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} style={{ color: 'var(--ctp-overlay1)' }} />
              </button>
            </Show>
          </div>
        </Show>
        <button
          class="w-6 h-6 flex items-center justify-center rounded-md text-overlay1 hover:text-text hover:bg-surface0 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
          onClick={() => startCreatingFile()}
          disabled={!workspaceState.workspacePath}
          title={t('newFile')}
        >
          <FilePlus size={16} />
        </button>
        <button
          class="w-6 h-6 flex items-center justify-center rounded-md text-overlay1 hover:text-text hover:bg-surface0 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors shrink-0"
          onClick={handleOpen}
          title={t('openDirectory')}
        >
          <FolderOpen size={16} />
        </button>
      </div>

      {/* File tree */}
      <div class="flex-1 overflow-y-auto">
        <Show
          when={workspaceState.workspacePath}
          fallback={
            <div class="px-3 py-8 text-xs text-overlay0 text-center">
              {t('openFolderToStart')}
            </div>
          }
        >
          <Show
            when={searchQuery()}
            fallback={
              <div class="pt-1 flex flex-col gap-0.5">
                <For each={workspaceState.tree}>
                  {(node) => (
                    <TreeNode
                      node={node}
                      depth={0}
                      selectedFile={workspaceState.selectedFile}
                      onFileClick={handleFileClick}
                      onContextMenu={handleContextMenu}
                      renamingPath={renamingPath()}
                      renameValue={renameValue()}
                      onRenameChange={setRenameValue}
                      onRenameConfirm={handleRenameConfirm}
                      onRenameCancel={handleRenameCancel}
                    />
                  )}
                </For>
                <Show when={creatingInDir() === workspaceState.workspacePath}>
                  <NewFileInput depth={0} />
                </Show>
              </div>
            }
          >
            <Show
              when={filteredFiles().length > 0}
              fallback={
                <div class="px-3 py-8 text-xs text-overlay0 text-center">
                  {t('noResults')}
                </div>
              }
            >
              <div class="pt-1 flex flex-col gap-0.5">
                <For each={filteredFiles()}>
                  {(file) => (
                    <TreeFileItem
                      file={file}
                      depth={0}
                      isActive={workspaceState.selectedFile === file.path}
                      onClick={handleFileClick}
                      onContextMenu={handleContextMenu}
                      isRenaming={renamingPath() === file.path}
                      renameValue={renameValue()}
                      onRenameChange={setRenameValue}
                      onRenameConfirm={handleRenameConfirm}
                      onRenameCancel={handleRenameCancel}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </Show>
      </div>

      {/* Context menu */}
      <Show when={contextMenu()}>
        {(menu) => (
          <ContextMenu
            x={menu().x}
            y={menu().y}
            onRename={handleStartRename}
            onDelete={handleStartDelete}
            onClose={() => setContextMenu(null)}
          />
        )}
      </Show>

      {/* Delete confirmation modal */}
      <Show when={deleteTarget()}>
        {(target) => (
          <div
            class="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setDeleteTarget(null)}
          >
            <div
              class="rounded-xl p-5 shadow-xl max-w-xs w-full"
              style={{ background: 'var(--ctp-base)', border: '1px solid var(--ctp-surface1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 class="text-sm font-semibold mb-2" style={{ color: 'var(--ctp-text)' }}>
                {t('confirmDelete')}
              </h3>
              <p class="text-xs mb-4" style={{ color: 'var(--ctp-subtext0)' }}>
                {tWith('deleteConfirmMessage', { name: target().name })}
              </p>
              <div class="flex justify-end gap-2">
                <button
                  class="px-3 py-1.5 text-xs rounded-md transition-colors"
                  style={{ background: 'var(--ctp-surface0)', color: 'var(--ctp-text)' }}
                  onClick={() => setDeleteTarget(null)}
                >
                  {t('cancel')}
                </button>
                <button
                  class="px-3 py-1.5 text-xs rounded-md transition-colors"
                  style={{ background: 'var(--ctp-red)', color: 'var(--ctp-base)' }}
                  onClick={handleDeleteConfirm}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
