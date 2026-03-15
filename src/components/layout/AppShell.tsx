import { onMount, onCleanup } from 'solid-js';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { FileListPane } from './FileListPane';
import { EditorPane } from './EditorPane';
import { TocPane } from './TocPane';
import { TitleBar } from './TitleBar';
import { StatusBar } from './StatusBar';
import { gridColumns } from '~/stores/layout';
import { saveFile, filePath, loadFile } from '~/stores/editor';
import { initWorkspace, openSingleFile, openWorkspace } from '~/stores/workspace';
import { openSettingsWindow } from '~/lib/settings-window';

export function AppShell() {
  onMount(async () => {
    initWorkspace();

    const unlisten = await listen<string>('menu-action', (event) => {
      switch (event.payload) {
        case 'open-file':
          openSingleFile().then((path) => {
            if (path) loadFile(path);
          });
          break;
        case 'open-folder':
          open({ directory: true }).then((selected) => {
            if (selected) openWorkspace(selected as string);
          });
          break;
        case 'save':
          if (filePath()) saveFile();
          break;
        case 'settings':
          openSettingsWindow();
          break;
      }
    });

    onCleanup(unlisten);
  });

  return (
    <div class="h-screen flex flex-col overflow-hidden bg-base">
      <TitleBar />
      <div
        class="flex-1 grid overflow-hidden"
        style={{ 'grid-template-columns': gridColumns() }}
      >
        <FileListPane />
        <EditorPane />
        <TocPane />
      </div>
      <StatusBar />
    </div>
  );
}
