import { tocVisible } from '~/stores/layout';
import { TocList } from '~/components/toc/TocList';

export function TocPane() {
  return (
    <div
      class="overflow-hidden flex flex-col border-l border-surface0"
      style={{
        'min-width': '0',
        'opacity': tocVisible() ? '1' : '0',
        'transition': 'opacity 200ms ease',
      }}
    >
      <div class="flex-1 overflow-y-auto pt-2">
        <TocList />
      </div>
    </div>
  );
}
