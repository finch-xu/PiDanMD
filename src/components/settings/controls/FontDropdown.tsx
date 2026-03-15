import { createSignal, createResource, For, Show, onCleanup } from 'solid-js';
import { listSystemFonts } from '~/lib/tauri/commands';
import type { BuiltinFont } from '~/stores/settings';
import { t } from '~/lib/i18n';
import ChevronDown from 'lucide-solid/icons/chevron-down';
import Check from 'lucide-solid/icons/check';

interface Props {
  label: string;
  value: string;
  builtinFonts: BuiltinFont[];
  onChange: (name: string) => void;
  type: 'text' | 'code';
  showSystemFonts?: boolean;
}

const [systemFonts] = createResource(async () => {
  try {
    return await listSystemFonts();
  } catch {
    return [];
  }
});

export function FontDropdown(props: Props) {
  const [open, setOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  // Close on outside click
  function handleClickOutside(e: MouseEvent) {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
  }

  // Mount/unmount listeners
  const startListening = () => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
  };
  const stopListening = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  };

  onCleanup(stopListening);

  function toggle() {
    const next = !open();
    setOpen(next);
    if (next) startListening();
    else stopListening();
  }

  function select(name: string) {
    props.onChange(name);
    setOpen(false);
    stopListening();
  }

  // Display label for current value
  const displayLabel = () => {
    const builtin = props.builtinFonts.find((f) => f.name === props.value);
    return builtin ? builtin.label : props.value;
  };

  return (
    <div ref={containerRef} class="relative">
      <Show when={props.label}><span class="text-sm text-subtext1 mb-2 block">{props.label}</span></Show>
      {/* Trigger button */}
      <button
        class="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-surface1 bg-base hover:bg-surface0/40 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors text-sm"
        onClick={toggle}
        aria-expanded={open()}
        aria-haspopup="listbox"
      >
        <span class="text-text truncate">{displayLabel()}</span>
        <ChevronDown size={12} class="text-subtext0 shrink-0 transition-transform" classList={{ 'rotate-180': open() }} />
      </button>

      {/* Dropdown */}
      <Show when={open()}>
        <div class="absolute z-50 mt-1 w-full max-h-[280px] overflow-y-auto rounded-lg border border-surface1 bg-mantle shadow-xl" role="listbox" aria-label={t('selectFont')}>
          {/* Built-in fonts */}
          <Show when={props.showSystemFonts !== false}>
            <div class="px-3 pt-2 pb-1 text-xs font-medium text-subtext0 uppercase tracking-wider" role="presentation">
              {t('builtinFonts')}
            </div>
          </Show>
          <For each={props.builtinFonts}>
            {(font) => {
              const isActive = () => props.value === font.name;
              return (
                <button
                  class="w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors"
                  classList={{
                    'bg-surface0 text-text': isActive(),
                    'text-subtext1 hover:bg-surface0/50 hover:text-text': !isActive(),
                  }}
                  role="option"
                  aria-selected={isActive()}
                  onClick={() => select(font.name)}
                >
                  <span class="truncate">{font.label}</span>
                  <Show when={isActive()}>
                    <Check size={12} class="text-text shrink-0" />
                  </Show>
                </button>
              );
            }}
          </For>

          {/* System fonts */}
          <Show when={props.showSystemFonts !== false}>
            <div class="px-3 pt-3 pb-1 text-xs font-medium text-subtext0 uppercase tracking-wider border-t border-surface0" role="presentation">
              {t('systemFonts')}
            </div>
            <Show
              when={!systemFonts.loading}
              fallback={
                <div class="px-3 py-2 text-xs text-subtext0">{t('loading')}</div>
              }
            >
              <For each={systemFonts() ?? []}>
                {(fontName) => {
                  const isActive = () => props.value === fontName;
                  return (
                    <button
                      class="w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors"
                      classList={{
                        'bg-surface0 text-text': isActive(),
                        'text-subtext1 hover:bg-surface0/50 hover:text-text': !isActive(),
                      }}
                      role="option"
                      aria-selected={isActive()}
                      onClick={() => select(fontName)}
                    >
                      <span
                        class="truncate"
                        style={{ 'font-family': `'${fontName}', sans-serif` }}
                      >
                        {fontName}
                      </span>
                      <Show when={isActive()}>
                        <Check size={12} class="text-text shrink-0" />
                      </Show>
                    </button>
                  );
                }}
              </For>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
}
