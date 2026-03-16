import { For, Show, createMemo } from 'solid-js';
import { fileListVisible } from '~/stores/layout';
import {
  workspaceState,
  openWorkspace,
  collectMarkdownFiles,
  selectFile,
  openSingleFile,
  toggleFolder,
} from '~/stores/workspace';
import type { FileNode } from '~/types/file-tree';
import { loadFile } from '~/stores/editor';
import { open } from '@tauri-apps/plugin-dialog';
import { t, noteCount, locale } from '~/lib/i18n';
import FileText from 'lucide-solid/icons/file-text';
import FolderOpen from 'lucide-solid/icons/folder-open';
import ChevronDown from 'lucide-solid/icons/chevron-down';
import ChevronRight from 'lucide-solid/icons/chevron-right';
import Folder from 'lucide-solid/icons/folder';

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

// --- Tree components ---

function TreeFileItem(props: {
  file: FileNode;
  depth: number;
  isActive: boolean;
  onClick: (path: string) => void;
}) {
  const displayName = () => props.file.name.replace(/\.md$/, '');
  const displayTitle = () => props.file.title || displayName();

  return (
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
  );
}

function TreeFolderItem(props: {
  node: FileNode;
  depth: number;
  onToggle: () => void;
}) {
  const mdCount = () => countMdFiles(props.node.children);

  return (
    <button
      class="w-full text-left rounded-md px-2 py-1 flex items-center gap-1 select-none hover:bg-surface0/50 transition-colors"
      style={{ 'padding-left': `${props.depth * 16 + 8}px` }}
      onClick={props.onToggle}
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
  );
}

function TreeNode(props: {
  node: FileNode;
  depth: number;
  selectedFile: string | null;
  onFileClick: (path: string) => void;
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
      />
    );
  }

  return (
    <>
      <TreeFolderItem
        node={props.node}
        depth={props.depth}
        onToggle={() => toggleFolder(props.node.path)}
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
              />
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

// --- Main component ---

export function FileListPane() {
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
  const fileCount = createMemo(() => mdFiles().length);

  const handleFileClick = (path: string) => {
    selectFile(path);
    loadFile(path);
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
      {/* Action bar */}
      <div
        class="px-3 py-2 flex items-center justify-between select-none shrink-0"
      >
        <Show
          when={workspaceState.workspacePath}
          fallback={<span class="text-xs text-overlay0">{t('workspaceNotOpened')}</span>}
        >
          <span class="text-xs text-overlay0">{noteCount(fileCount())}</span>
        </Show>
        <div class="flex items-center gap-0.5">
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-overlay1 hover:text-text hover:bg-surface0 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors"
            onClick={() => openSingleFile().then((p) => { if (p) loadFile(p); }).catch((e) => console.error('Failed to open file dialog:', e))}
            title={t('openFile')}
          >
            <FileText size={16} />
          </button>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-overlay1 hover:text-text hover:bg-surface0 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors"
            onClick={handleOpen}
            title={t('openDirectory')}
          >
            <FolderOpen size={16} />
          </button>
        </div>
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
          <div class="pt-1 flex flex-col gap-0.5">
            <For each={workspaceState.tree}>
              {(node) => (
                <TreeNode
                  node={node}
                  depth={0}
                  selectedFile={workspaceState.selectedFile}
                  onFileClick={handleFileClick}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
