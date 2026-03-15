import { For, Show, createMemo, createSignal } from 'solid-js';
import { fileListVisible } from '~/stores/layout';
import {
  workspaceState,
  openWorkspace,
  collectMarkdownFiles,
  collectMarkdownFilesByGroup,
  selectFile,
  openSingleFile,
} from '~/stores/workspace';
import type { FileGroup } from '~/stores/workspace';
import { loadFile } from '~/stores/editor';
import { open } from '@tauri-apps/plugin-dialog';
import { t, noteCount, locale } from '~/lib/i18n';
import FileText from 'lucide-solid/icons/file-text';
import FolderOpen from 'lucide-solid/icons/folder-open';
import ChevronDown from 'lucide-solid/icons/chevron-down';
import ChevronRight from 'lucide-solid/icons/chevron-right';

function formatDate(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
  }
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return d.toLocaleDateString(locale(), { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' });
}

function FileItem(props: { file: import('~/types/file-tree').FileNode; isActive: boolean; onClick: (path: string) => void }) {
  const displayName = () => props.file.name.replace(/\.md$/, '');
  const displayTitle = () => props.file.title || displayName();
  return (
    <button
      class="w-full text-left mx-2 rounded-md px-3 py-2 transition-colors focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none file-item"
      style={{
        width: 'calc(100% - 1rem)',
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
      <div class="text-xs truncate" style={{ color: 'var(--ctp-overlay1)' }}>
        {displayName()}
      </div>
      <div class="text-xs mt-0.5 text-overlay0">
        {formatDate(props.file.modified)}
      </div>
    </button>
  );
}

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
  const groups = createMemo(() => collectMarkdownFilesByGroup());
  const fileCount = createMemo(() => mdFiles().length);
  const showGroups = createMemo(() => groups().length > 1);

  const [collapsedSet, setCollapsedSet] = createSignal<Set<string>>(new Set());
  const isCollapsed = (folderPath: string) => collapsedSet().has(folderPath);
  const toggleGroup = (folderPath: string) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  };

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

      {/* File list */}
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
            <Show
              when={showGroups()}
              fallback={
                <For each={mdFiles()}>
                  {(file) => <FileItem file={file} isActive={workspaceState.selectedFile === file.path} onClick={handleFileClick} />}
                </For>
              }
            >
              <For each={groups()}>
                {(group, index) => (
                  <>
                    <button
                      class="w-full text-left px-3 py-1 flex items-center gap-1 select-none hover:bg-surface0/50 transition-colors"
                      style={{ 'margin-top': index() > 0 ? '0.5rem' : '0' }}
                      onClick={() => toggleGroup(group.folderPath)}
                    >
                      <Show when={isCollapsed(group.folderPath)} fallback={<ChevronDown size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />}>
                        <ChevronRight size={14} style={{ color: 'var(--ctp-subtext0)', 'flex-shrink': '0' }} />
                      </Show>
                      <span class="text-xs font-semibold truncate" style={{ color: 'var(--ctp-subtext1)', 'text-transform': 'uppercase' }}>{group.folderName}</span>
                      <span class="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--ctp-subtext0)' }}>{group.files.length}</span>
                    </button>
                    <Show when={!isCollapsed(group.folderPath)}>
                      <div style={{ 'padding-left': '12px' }}>
                        <For each={group.files}>
                          {(file) => <FileItem file={file} isActive={workspaceState.selectedFile === file.path} onClick={handleFileClick} />}
                        </For>
                      </div>
                    </Show>
                  </>
                )}
              </For>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
