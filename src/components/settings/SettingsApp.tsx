import { createSignal, createMemo, For, Switch, Match, type JSX } from 'solid-js';
import { ThemeSwatches } from './controls/ThemeSwatches';
import { FontDropdown } from './controls/FontDropdown';
import { SegmentedControl } from './controls/SegmentedControl';
import { NumberStepper } from './controls/NumberStepper';
import {
  settings,
  updateSettings,
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
import ChevronLeft from 'lucide-solid/icons/chevron-left';
import ChevronRight from 'lucide-solid/icons/chevron-right';

/* ── FontIcon: 紫色方块 + 白色 A ── */
function FontIcon() {
  return (
    <div class="w-5 h-5 rounded bg-mauve flex items-center justify-center">
      <span class="text-[10px] font-bold text-base leading-none">A</span>
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
  return (
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
  );
}

/* ── Pane: 主题 ── */
function ThemePane() {
  return <ThemeSwatches />;
}

/* ── Pane: 阅读 ── */
function ReadingPane() {
  return (
    <div class="space-y-5">
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
    <div class="space-y-5">
      <h3 class="text-lg font-medium text-text mb-4">{t('uiLabel')}</h3>

      {/* 界面字体 + 字号 */}
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtext1 w-16 shrink-0">{t('uiLabel')}</span>
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
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtext1 w-16 shrink-0">{t('bodyLabel')}</span>
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
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtext1 w-16 shrink-0">{t('codeLabel')}</span>
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
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtext1 w-16 shrink-0">{t('symbolLabel')}</span>
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
  );
}

/* ── 主布局 ── */
export function SettingsApp() {
  const [activeTab, setActiveTab] = createSignal<TabId>('basic');

  const activeIdx = createMemo(() => tabs.findIndex((t) => t.id === activeTab()));
  const canGoPrev = () => activeIdx() > 0;
  const canGoNext = () => activeIdx() < tabs.length - 1;
  const goPrev = () => { if (canGoPrev()) setActiveTab(tabs[activeIdx() - 1].id); };
  const goNext = () => { if (canGoNext()) setActiveTab(tabs[activeIdx() + 1].id); };
  const activeTabLabel = () => tabs[activeIdx()].label();

  return (
    <div class="h-screen flex overflow-hidden">
      {/* 左侧边栏 */}
      <nav class="w-40 shrink-0 bg-mantle pt-10 px-2 space-y-0.5">
        <For each={tabs}>
          {(tab) => (
            <button
              class="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors"
              classList={{
                'text-text font-medium': activeTab() === tab.id,
                'text-subtext1 hover:bg-surface0/50': activeTab() !== tab.id,
              }}
              style={activeTab() === tab.id
                ? { background: 'color-mix(in srgb, var(--ctp-overlay1) 15%, transparent)' }
                : {}}
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
      </nav>

      {/* 右侧：顶部导航 + 内容 */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header class="flex items-center px-4 py-3 border-b border-surface0/50 shrink-0">
          <button
            class="p-1 rounded transition-colors disabled:opacity-30"
            classList={{ 'text-subtext1 hover:text-text hover:bg-surface0/50': canGoPrev() }}
            onClick={goPrev}
            disabled={!canGoPrev()}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            class="p-1 rounded transition-colors disabled:opacity-30"
            classList={{ 'text-subtext1 hover:text-text hover:bg-surface0/50': canGoNext() }}
            onClick={goNext}
            disabled={!canGoNext()}
          >
            <ChevronRight size={16} />
          </button>
          <span class="flex-1 text-center text-sm font-medium text-text">
            {activeTabLabel()}
          </span>
          <div class="w-[52px]" />
        </header>

        {/* 内容区 */}
        <main class="flex-1 overflow-y-auto px-8 py-8">
          <Switch>
            <Match when={activeTab() === 'basic'}><BasicPane /></Match>
            <Match when={activeTab() === 'theme'}><ThemePane /></Match>
            <Match when={activeTab() === 'reading'}><ReadingPane /></Match>
            <Match when={activeTab() === 'typography'}><TypographyPane /></Match>
          </Switch>
        </main>
      </div>
    </div>
  );
}
