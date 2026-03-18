import { createSignal, For, Switch, Match, type JSX } from 'solid-js';
import { ThemeSwatches } from './controls/ThemeSwatches';
import { FontDropdown } from './controls/FontDropdown';
import { SegmentedControl } from './controls/SegmentedControl';
import { NumberStepper } from './controls/NumberStepper';
import {
  settings,
  updateSettings,
  resetToDefaults,
  BUILTIN_TEXT_FONTS,
  BUILTIN_CODE_FONTS,
  type BuiltinFont,
  type LineHeight,
  type ContentWidth,
} from '~/stores/settings';
import { locale, setLocale, t, type Locale } from '~/lib/i18n';
import SettingsIcon from 'lucide-solid/icons/settings';
import Palette from 'lucide-solid/icons/palette';
import ScanEye from 'lucide-solid/icons/scan-eye';

/* ── FontIcon: 紫色方块 + 白色 A ── */
function FontIcon() {
  return (
    <div class="w-5 h-5 rounded bg-mauve flex items-center justify-center">
      <span class="text-[10px] font-bold text-base leading-none">A</span>
    </div>
  );
}

/* ── SettingsCard: 卡片分组容器 ── */
function SettingsCard(props: { children: JSX.Element; class?: string }) {
  return (
    <div class={`rounded-xl bg-surface0/25 px-4 py-3 ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}

type TabId = 'basic' | 'theme' | 'reading' | 'typography';

const tabs: { id: TabId; label: () => string; icon: () => JSX.Element }[] = [
  { id: 'basic', label: () => t('basic'), icon: () => <SettingsIcon size={18} /> },
  { id: 'theme', label: () => t('theme'), icon: () => <Palette size={18} /> },
  { id: 'reading', label: () => t('reading'), icon: () => <ScanEye size={18} /> },
  { id: 'typography', label: () => t('typography'), icon: () => <FontIcon /> },
];

/* ── Pane: 基础 ── */
function BasicPane() {
  const [confirming, setConfirming] = createSignal(false);

  return (
    <div class="space-y-3">
      <SettingsCard>
        <SegmentedControl<Locale>
          label={t('language')}
          value={locale()}
          options={[
            { value: 'zh-CN', label: '简体' },
            { value: 'zh-TW', label: '繁體' },
            { value: 'en-US', label: 'EN' },
            { value: 'ja-JP', label: '日本語' },
            { value: 'ko-KR', label: '한국어' },
          ]}
          onChange={(v) => setLocale(v)}
          minWidth="280px"
        />
      </SettingsCard>

      <SettingsCard class="pt-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-subtext1">{t('resetConfig')}</span>
          <button
            class="px-3 py-1.5 text-sm rounded-md transition-colors bg-surface0/50 text-subtext1 hover:bg-red/20 hover:text-red"
            onClick={async () => {
              if (!confirming()) { setConfirming(true); return; }
              await resetToDefaults();
              setConfirming(false);
            }}
          >
            {confirming() ? t('confirmReset') : t('resetConfig')}
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ── Pane: 主题 ── */
function ThemePane() {
  return (
    <SettingsCard>
      <ThemeSwatches />
    </SettingsCard>
  );
}

/* ── Pane: 阅读 ── */
function ReadingPane() {
  return (
    <SettingsCard>
      <div class="divide-y divide-surface0/40">
        <div class="pb-3">
          <SegmentedControl<ContentWidth>
            label={t('contentWidth')}
            value={settings().contentWidth}
            options={[
              { value: 'narrow', label: t('narrow') },
              { value: 'standard', label: t('standard') },
              { value: 'wide', label: t('wide') },
            ]}
            onChange={(v) => updateSettings({ contentWidth: v })}
          />
        </div>
        <div class="pt-3">
          <SegmentedControl<LineHeight>
            label={t('lineHeight')}
            value={settings().lineHeight}
            options={[
              { value: 'compact', label: t('compact') },
              { value: 'comfortable', label: t('comfortable') },
              { value: 'loose', label: t('loose') },
            ]}
            onChange={(v) => updateSettings({ lineHeight: v })}
          />
        </div>
      </div>
    </SettingsCard>
  );
}

/* ── Pane: 字体 ── */
function TypographyPane() {
  const symbolFonts = (): BuiltinFont[] => [
    { name: 'Noto Color Emoji', label: 'Noto Color Emoji', css: "'Noto Color Emoji'" },
    { name: 'Noto Sans Symbols', label: 'Noto Sans Symbols', css: "'Noto Sans Symbols'" },
    { name: 'system', label: t('followSystem'), css: '' },
  ];

  return (
    <SettingsCard>
      <div class="divide-y divide-surface0/40">
        {/* 界面字体 + 字号 */}
        <div class="flex items-center gap-4 -mx-1 px-1 rounded-lg hover:bg-surface0/15 py-2.5">
          <span class="text-sm text-subtext1 w-14 shrink-0">{t('uiLabel')}</span>
          <div class="flex-1">
            <FontDropdown
              label=""
              value={settings().uiFont}
              builtinFonts={BUILTIN_TEXT_FONTS}
              onChange={(v) => updateSettings({ uiFont: v })}
              type="text"
            />
          </div>
          <NumberStepper
            value={settings().uiFontSize}
            min={12} max={24} step={1}
            onChange={(v) => updateSettings({ uiFontSize: v })}
          />
        </div>

        {/* 内容字体 + 字号 */}
        <div class="flex items-center gap-4 -mx-1 px-1 rounded-lg hover:bg-surface0/15 py-2.5">
          <span class="text-sm text-subtext1 w-14 shrink-0">{t('bodyLabel')}</span>
          <div class="flex-1">
            <FontDropdown
              label=""
              value={settings().bodyFont}
              builtinFonts={BUILTIN_TEXT_FONTS}
              onChange={(v) => updateSettings({ bodyFont: v })}
              type="text"
            />
          </div>
          <NumberStepper
            value={settings().bodyFontSize}
            min={12} max={24} step={1}
            onChange={(v) => updateSettings({ bodyFontSize: v })}
          />
        </div>

        {/* 代码字体 + 字号 */}
        <div class="flex items-center gap-4 -mx-1 px-1 rounded-lg hover:bg-surface0/15 py-2.5">
          <span class="text-sm text-subtext1 w-14 shrink-0">{t('codeLabel')}</span>
          <div class="flex-1">
            <FontDropdown
              label=""
              value={settings().codeFont}
              builtinFonts={BUILTIN_CODE_FONTS}
              onChange={(v) => updateSettings({ codeFont: v })}
              type="code"
            />
          </div>
          <NumberStepper
            value={settings().codeFontSize}
            min={10} max={22} step={1}
            onChange={(v) => updateSettings({ codeFontSize: v })}
          />
        </div>

        {/* 符号字体 */}
        <div class="flex items-center gap-4 -mx-1 px-1 rounded-lg hover:bg-surface0/15 py-2.5">
          <span class="text-sm text-subtext1 w-14 shrink-0">{t('symbolLabel')}</span>
          <div class="flex-1">
            <FontDropdown
              label=""
              value={settings().symbolFont}
              builtinFonts={symbolFonts()}
              onChange={(v) => updateSettings({ symbolFont: v })}
              type="text"
              showSystemFonts={false}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ── 主布局 ── */
export function SettingsApp() {
  const [activeTab, setActiveTab] = createSignal<TabId>('basic');

  return (
    <div class="h-screen flex overflow-hidden">
      {/* 左侧边栏 */}
      <nav class="w-44 shrink-0 bg-mantle px-2 flex flex-col">
        {/* 品牌区 */}
        <div class="flex items-center gap-2.5 px-3 pt-8 pb-4">
          <img src="/logo.png" alt="logo" class="w-7 h-7 rounded-lg" />
          <span class="text-sm font-semibold text-text">{t('appName')}</span>
        </div>

        <div class="border-t border-surface0/40 mx-2 mb-2" />

        {/* 导航按钮 */}
        <div class="space-y-0.5">
          <For each={tabs}>
            {(tab) => (
              <button
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                classList={{
                  'text-text font-medium bg-surface0/60': activeTab() === tab.id,
                  'text-subtext1 hover:bg-surface0/50 hover:text-text': activeTab() !== tab.id,
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span class="shrink-0" classList={{
                  'text-text': activeTab() === tab.id,
                  'text-overlay1': activeTab() !== tab.id,
                }}>
                  {tab.icon()}
                </span>
                {tab.label()}
              </button>
            )}
          </For>
        </div>
      </nav>

      {/* 右侧内容区 */}
      <main class="flex-1 overflow-y-auto px-7 py-6">
        <Switch>
          <Match when={activeTab() === 'basic'}><BasicPane /></Match>
          <Match when={activeTab() === 'theme'}><ThemePane /></Match>
          <Match when={activeTab() === 'reading'}><ReadingPane /></Match>
          <Match when={activeTab() === 'typography'}><TypographyPane /></Match>
        </Switch>
      </main>
    </div>
  );
}
