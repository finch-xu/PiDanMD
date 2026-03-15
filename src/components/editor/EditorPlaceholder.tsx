import { t } from '~/lib/i18n';

export function EditorPlaceholder() {
  return (
    <div class="h-full flex items-center justify-center">
      <p class="text-lg font-light text-overlay0/40 select-none">{t('appName')}</p>
    </div>
  );
}
