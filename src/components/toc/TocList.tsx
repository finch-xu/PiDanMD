import { For, Show } from 'solid-js';
import { headings } from '~/stores/toc';
import { TocItem } from './TocItem';
import { t } from '~/lib/i18n';

export function TocList() {
  return (
    <Show
      when={headings().length > 0}
      fallback={
        <div class="px-3 py-2 text-xs text-overlay0">
          {t('noHeadings')}
        </div>
      }
    >
      <nav class="px-1 py-1" aria-label={t('documentToc')}>
        <For each={headings()}>
          {(heading) => <TocItem heading={heading} />}
        </For>
      </nav>
    </Show>
  );
}
