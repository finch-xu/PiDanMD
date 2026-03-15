import { For } from 'solid-js';
import { settings, updateSettings, type Theme } from '~/stores/settings';
import { t } from '~/lib/i18n';

interface ThemeColors {
  base: string;
  mantle: string;
  text: string;
  subtext: string;
  surface0: string;
  accent: string;
}

const THEME_COLORS: Record<Exclude<Theme, 'system'>, ThemeColors> = {
  light: { base: '#ffffff', mantle: '#f5f5f7', text: '#1d1d1f', subtext: '#636366', surface0: '#e5e5ea', accent: '#8e8e93' },
  dark: { base: '#1c1c1e', mantle: '#2c2c2e', text: '#f5f5f7', subtext: '#8e8e93', surface0: '#3a3a3c', accent: '#8e8e93' },
  mocha: { base: '#1e1e2e', mantle: '#181825', text: '#cdd6f4', subtext: '#a6adc8', surface0: '#313244', accent: '#7f849c' },
  latte: { base: '#eff1f5', mantle: '#e6e9ef', text: '#4c4f69', subtext: '#6c6f85', surface0: '#ccd0da', accent: '#8c8fa1' },
  frappe: { base: '#303446', mantle: '#292c3c', text: '#c6d0f5', subtext: '#a5adce', surface0: '#414559', accent: '#838ba7' },
  macchiato: { base: '#24273a', mantle: '#1e2030', text: '#cad3f5', subtext: '#a5adcb', surface0: '#363a4f', accent: '#8087a2' },
};

function getSystemThemes(): { value: Theme; label: string }[] {
  return [
    { value: 'system', label: t('followSystem') },
    { value: 'light', label: t('lightTheme') },
    { value: 'dark', label: t('darkTheme') },
  ];
}

function getCatppuccinThemes(): { value: Theme; label: string; type: string }[] {
  return [
    { value: 'mocha', label: 'Mocha', type: t('catDark') },
    { value: 'latte', label: 'Latte', type: t('catLight') },
    { value: 'frappe', label: 'Frappé', type: t('catDark') },
    { value: 'macchiato', label: 'Macchiato', type: t('catDark') },
  ];
}

function MiniPreview(props: { colors: ThemeColors; split?: boolean; splitColors?: ThemeColors }) {
  return (
    <div class="w-full h-full flex">
      {props.split && props.splitColors ? (
        <>
          <div class="w-1/2 h-full flex flex-col overflow-hidden">
            <div class="h-[18%] flex items-center px-1 gap-0.5" style={{ background: props.colors.mantle }}>
              <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
              <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
              <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
            </div>
            <div class="flex-1 px-1.5 py-1 flex flex-col gap-[2px]" style={{ background: props.colors.base }}>
              <div class="h-[3px] rounded-full w-[70%]" style={{ background: props.colors.text, opacity: 0.6 }} />
              <div class="h-[3px] rounded-full w-[50%]" style={{ background: props.colors.subtext, opacity: 0.4 }} />
              <div class="h-[3px] rounded-full w-[85%]" style={{ background: props.colors.text, opacity: 0.6 }} />
            </div>
          </div>
          <div class="w-1/2 h-full flex flex-col overflow-hidden">
            <div class="h-[18%] flex items-center px-1 gap-0.5" style={{ background: props.splitColors.mantle }}>
              <div class="w-1 h-1 rounded-full" style={{ background: props.splitColors.surface0 }} />
              <div class="w-1 h-1 rounded-full" style={{ background: props.splitColors.surface0 }} />
              <div class="w-1 h-1 rounded-full" style={{ background: props.splitColors.surface0 }} />
            </div>
            <div class="flex-1 px-1.5 py-1 flex flex-col gap-[2px]" style={{ background: props.splitColors.base }}>
              <div class="h-[3px] rounded-full w-[70%]" style={{ background: props.splitColors.text, opacity: 0.6 }} />
              <div class="h-[3px] rounded-full w-[50%]" style={{ background: props.splitColors.subtext, opacity: 0.4 }} />
              <div class="h-[3px] rounded-full w-[85%]" style={{ background: props.splitColors.text, opacity: 0.6 }} />
            </div>
          </div>
        </>
      ) : (
        <div class="w-full h-full flex flex-col">
          <div class="h-[18%] flex items-center px-1.5 gap-0.5" style={{ background: props.colors.mantle }}>
            <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
            <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
            <div class="w-1 h-1 rounded-full" style={{ background: props.colors.surface0 }} />
          </div>
          <div class="flex-1 px-2 py-1.5 flex flex-col gap-[3px]" style={{ background: props.colors.base }}>
            <div class="h-[3px] rounded-full w-[70%]" style={{ background: props.colors.text, opacity: 0.6 }} />
            <div class="h-[3px] rounded-full w-[50%]" style={{ background: props.colors.subtext, opacity: 0.4 }} />
            <div class="h-[3px] rounded-full w-[85%]" style={{ background: props.colors.text, opacity: 0.6 }} />
            <div class="h-[3px] rounded-full w-[40%]" style={{ background: props.colors.accent, opacity: 0.5 }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemeSwatches() {
  return (
    <div>
      <span class="text-sm text-subtext1 mb-3 block">{t('theme')}</span>

      {/* System themes: 3 large buttons */}
      <div class="grid grid-cols-3 gap-3 mb-5">
        <For each={getSystemThemes()}>
          {(t) => {
            const isActive = () => settings().theme === t.value;
            const isSystem = t.value === 'system';
            const colors = isSystem ? THEME_COLORS.light : THEME_COLORS[t.value as Exclude<Theme, 'system'>];
            return (
              <button
                class="group flex flex-col items-center gap-2 cursor-pointer focus-visible:outline-none"
                onClick={() => updateSettings({ theme: t.value })}
                aria-label={t.label}
              >
                <div
                  class="w-full aspect-[4/3] rounded-xl overflow-hidden border transition-all duration-150 group-focus-visible:ring-2 group-focus-visible:ring-overlay1"
                  classList={{
                    'ring-2 ring-overlay1 border-overlay1': isActive(),
                    'border-surface0 hover:scale-[1.02]': !isActive(),
                  }}
                >
                  <MiniPreview
                    colors={colors}
                    split={isSystem}
                    splitColors={isSystem ? THEME_COLORS.dark : undefined}
                  />
                </div>
                <span class={`text-sm transition-colors ${
                  isActive() ? 'text-text font-medium' : 'text-subtext0'
                }`}>
                  {t.label}
                </span>
              </button>
            );
          }}
        </For>
      </div>

      {/* Catppuccin themes */}
      <span class="text-xs text-overlay1 mb-2.5 block">Catppuccin</span>
      <div class="grid grid-cols-4 gap-3">
        <For each={getCatppuccinThemes()}>
          {(t) => {
            const colors = THEME_COLORS[t.value as Exclude<Theme, 'system'>];
            const isActive = () => settings().theme === t.value;
            return (
              <button
                class="group flex flex-col items-center gap-2 cursor-pointer focus-visible:outline-none"
                onClick={() => updateSettings({ theme: t.value })}
                aria-label={t.label}
              >
                <div
                  class="w-full aspect-[4/3] rounded-xl overflow-hidden border transition-all duration-150 group-focus-visible:ring-2 group-focus-visible:ring-overlay1"
                  classList={{
                    'ring-2 ring-overlay1 border-overlay1': isActive(),
                    'border-surface0 hover:scale-[1.02]': !isActive(),
                  }}
                >
                  <MiniPreview colors={colors} />
                </div>
                <div class="flex flex-col items-center">
                  <span class={`text-sm transition-colors ${
                    isActive() ? 'text-text font-medium' : 'text-subtext0'
                  }`}>
                    {t.label}
                  </span>
                  <span class="text-xs text-overlay0">{t.type}</span>
                </div>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
}
