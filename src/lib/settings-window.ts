import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { t } from '~/lib/i18n';

export async function openSettingsWindow() {
  const existing = await WebviewWindow.getByLabel('settings');
  if (existing) {
    await existing.setFocus();
    return;
  }
  new WebviewWindow('settings', {
    url: 'settings.html',
    title: t('settings'),
    width: 680,
    height: 520,
    center: true,
    resizable: false,
    maximizable: false,
    minimizable: true,
    decorations: true,
  });
}
