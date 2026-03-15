import { workspaceState, openWorkspace, openSingleFile } from '~/stores/workspace';
import { loadFile } from '~/stores/editor';
import { open } from '@tauri-apps/plugin-dialog';
import { t } from '~/lib/i18n';
import FileText from 'lucide-solid/icons/file-text';

export function WorkspaceHeader() {
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

  const handleOpenFile = async () => {
    try {
      const path = await openSingleFile();
      if (path) loadFile(path);
    } catch (e) {
      console.error('Failed to open file dialog:', e);
    }
  };

  const folderName = () => {
    const p = workspaceState.workspacePath;
    if (!p) return null;
    return p.split('/').pop() || p;
  };

  return (
    <div class="px-3 py-2 flex items-center justify-between select-none shrink-0"
         style={{ 'border-bottom': '1px solid var(--ctp-surface0)' }}>
      <span class="text-sm font-light text-subtext1 truncate">
        {folderName() || t('notOpened')}
      </span>
      <div class="flex items-center gap-1">
        <button
          onClick={handleOpenFile}
          class="text-overlay1 hover:text-text focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none rounded-sm transition-colors p-0.5"
          title={t('openFile')}
        >
          <FileText size={16} />
        </button>
        <button
          onClick={handleOpen}
          class="text-xs text-overlay1 hover:text-text focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none rounded-sm transition-colors px-1.5 py-0.5"
          title={t('openFolder')}
        >
          {t('open')}
        </button>
      </div>
    </div>
  );
}
