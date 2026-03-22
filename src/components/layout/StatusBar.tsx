import { Show } from 'solid-js';
import { filePath, isDirty, renderingMode, setRenderingMode, type RenderingMode } from '~/stores/editor';
import { t } from '~/lib/i18n';
import { createDropdown } from '~/lib/utils/dropdown';

const MODES: { value: RenderingMode; label: () => string }[] = [
  { value: 'default', label: () => t('modeDefault') },
  { value: 'hexo', label: () => t('modeHexo') },
  { value: 'jekyll', label: () => t('modeJekyll') },
  { value: 'hugo', label: () => t('modeHugo') },
  { value: 'skill', label: () => t('modeSkill') },
];

export function StatusBar() {
  const dropdown = createDropdown();

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

      {/* Spacer */}
      <span class="flex-1" />

      {/* Rendering mode selector */}
      <div ref={dropdown.setRef} class="relative">
        <button
          class="flex items-center gap-1 px-1.5 rounded hover:bg-surface0 hover:text-text transition-colors"
          classList={{ 'text-blue': renderingMode() !== 'default' }}
          onClick={dropdown.toggle}
          title={t('renderingMode')}
        >
          <span>{MODES.find((m) => m.value === renderingMode())?.label() ?? renderingMode()}</span>
          <span class="text-[10px]">▾</span>
        </button>
        <Show when={dropdown.isOpen()}>
          <div class="absolute bottom-full right-0 mb-1 rounded-lg border border-surface1 bg-mantle shadow-xl z-50 p-1 min-w-[120px]">
            {MODES.map((mode) => (
              <button
                class="flex items-center gap-2 w-full px-2.5 py-1 rounded-md text-xs hover:bg-surface0 transition-colors whitespace-nowrap"
                classList={{
                  'text-blue': renderingMode() === mode.value,
                  'text-text': renderingMode() !== mode.value,
                }}
                onClick={() => { setRenderingMode(mode.value); dropdown.close(); }}
              >
                <span class="w-3 text-center">{renderingMode() === mode.value ? '●' : '○'}</span>
                <span>{mode.label()}</span>
              </button>
            ))}
          </div>
        </Show>
      </div>
    </div>
  );
}
