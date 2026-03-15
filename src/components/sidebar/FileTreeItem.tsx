import { For, Show } from 'solid-js';
import type { FileNode } from '~/types/file-tree';
import { workspaceState, toggleFolder, selectFile } from '~/stores/workspace';
import { loadFile } from '~/stores/editor';

interface Props {
  node: FileNode;
  depth: number;
}

export function FileTreeItem(props: Props) {
  const isSelected = () => workspaceState.selectedFile === props.node.path;

  const handleClick = () => {
    if (props.node.isDirectory) {
      toggleFolder(props.node.path);
    } else if (!isSelected()) {
      selectFile(props.node.path);
      loadFile(props.node.path);
    }
  };

  return (
    <div>
      <div
        class="flex items-center cursor-pointer text-sm py-0.5 transition-colors"
        classList={{
          'text-text': isSelected(),
          'text-subtext0': !isSelected(),
          'hover:bg-surface0/30': !isSelected(),
        }}
        style={{
          'padding-left': `${props.depth * 16 + 8}px`,
          'padding-right': '8px',
          ...(isSelected() ? { 'background': 'color-mix(in srgb, var(--ctp-overlay1) 15%, transparent)' } : {}),
        }}
        onClick={handleClick}
      >
        <Show when={props.node.isDirectory}>
          <span
            class="inline-block w-3 text-xs text-overlay1 mr-1 transition-transform"
            style={{
              'transform': props.node.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            &#9656;
          </span>
        </Show>
        <Show when={!props.node.isDirectory}>
          <span class="inline-block w-3 mr-1" />
        </Show>
        <span class="truncate font-light">{props.node.name}</span>
      </div>
      <Show when={props.node.isDirectory && props.node.isExpanded}>
        <Show when={props.node.isLoading}>
          <div
            class="text-xs text-overlay0 py-0.5"
            style={{ 'padding-left': `${(props.depth + 1) * 16 + 8}px` }}
          >
            ...
          </div>
        </Show>
        <For each={props.node.children || []}>
          {(child) => <FileTreeItem node={child} depth={props.depth + 1} />}
        </For>
      </Show>
    </div>
  );
}
