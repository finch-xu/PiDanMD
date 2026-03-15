import { Show } from 'solid-js';
import { filePath, isDirty } from '~/stores/editor';
import { t } from '~/lib/i18n';

export function StatusBar() {
  return (
    <div class="h-6 flex items-center pl-5 pr-3 select-none shrink-0 text-xs bg-mantle border-t border-surface0 text-overlay0">
      <Show when={filePath()}>
        <span class="truncate">{filePath()}</span>
        <Show when={isDirty()}>
          <span
            class="ml-2 shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-overlay1"
            title={t('unsaved')}
          />
        </Show>
      </Show>
    </div>
  );
}
