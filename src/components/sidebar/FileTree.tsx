import { For, Show } from 'solid-js';
import { workspaceState } from '~/stores/workspace';
import { FileTreeItem } from './FileTreeItem';
import { t } from '~/lib/i18n';

export function FileTree() {
  return (
    <Show
      when={workspaceState.workspacePath}
      fallback={
        <div class="px-3 py-4 text-xs text-overlay0 text-center">
          {t('openFolderToStart')}
        </div>
      }
    >
      <div class="py-1">
        <For each={workspaceState.tree}>
          {(node) => <FileTreeItem node={node} depth={0} />}
        </For>
      </div>
    </Show>
  );
}
