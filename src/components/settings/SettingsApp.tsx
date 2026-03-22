import { createSignal, For, Show, Switch, Match, type JSX } from 'solid-js';
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
    <div class={`rounded-xl bg-base border border-surface0/60 shadow-sm px-6 py-1 ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}

/* ── SettingsRow: 标签 + 控件行 ── */
function SettingsRow(props: { label?: string; children: JSX.Element; border?: boolean }) {
  return (
    <div
      class="flex items-center justify-between py-4"
      classList={{ 'border-b border-surface0/40': props.border !== false }}
    >
      {props.label && <span class="text-sm font-medium text-subtext1">{props.label}</span>}
      {props.children}
    </div>
  );
}

/* ── SectionHeader: 分区标题 ── */
function SectionHeader(props: { title: string }) {
  return <h2 class="text-lg font-semibold text-text mb-5">{props.title}</h2>;
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
    <div>
      <SectionHeader title={t('basic')} />
      <SettingsCard>
        <SettingsRow label={t('language')}>
          <SegmentedControl<Locale>
            label=""
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
        </SettingsRow>
        <SettingsRow label={t('resetConfig')} border={false}>
          <button
            class="text-sm text-red font-medium px-4 py-2 hover:bg-red/10 rounded-lg transition-colors"
            onClick={async () => {
              if (!confirming()) { setConfirming(true); return; }
              await resetToDefaults();
              setConfirming(false);
            }}
          >
            {confirming() ? t('confirmReset') : t('resetConfig')}
          </button>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

/* ── Pane: 主题 ── */
function ThemePane() {
  return (
    <div>
      <SectionHeader title={t('theme')} />
      <SettingsCard class="py-4">
        <ThemeSwatches />
      </SettingsCard>
    </div>
  );
}

/* ── Pane: 阅读 ── */
function ReadingPane() {
  return (
    <div>
      <SectionHeader title={t('reading')} />
      <SettingsCard>
        <SettingsRow label={t('contentWidth')}>
          <SegmentedControl<ContentWidth>
            label=""
            value={settings().contentWidth}
            options={[
              { value: 'narrow', label: t('narrow') },
              { value: 'standard', label: t('standard') },
              { value: 'wide', label: t('wide') },
            ]}
            onChange={(v) => updateSettings({ contentWidth: v })}
          />
        </SettingsRow>
        <SettingsRow label={t('lineHeight')} border={false}>
          <SegmentedControl<LineHeight>
            label=""
            value={settings().lineHeight}
            options={[
              { value: 'compact', label: t('compact') },
              { value: 'comfortable', label: t('comfortable') },
              { value: 'loose', label: t('loose') },
            ]}
            onChange={(v) => updateSettings({ lineHeight: v })}
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

/* ── Pane: 字体 ── */
function TypographyPane() {
  return (
    <div>
      <SectionHeader title={t('typography')} />
      <SettingsCard>
        <SettingsRow label={t('uiLabel')}>
          <div class="flex items-center gap-3">
            <div class="w-48">
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
        </SettingsRow>

        <SettingsRow label={t('bodyLabel')}>
          <div class="flex items-center gap-3">
            <div class="w-48">
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
        </SettingsRow>

        <SettingsRow label={t('codeLabel')}>
          <div class="flex items-center gap-3">
            <div class="w-48">
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
        </SettingsRow>

      </SettingsCard>
    </div>
  );
}

/* ── 主布局 ── */
export function SettingsApp() {
  const [activeTab, setActiveTab] = createSignal<TabId>('basic');

  return (
    <div class="h-screen flex overflow-hidden bg-mantle">
      {/* 左侧边栏 */}
      <nav class="w-56 shrink-0 bg-mantle border-r border-surface0/40 px-3 flex flex-col">
        {/* 品牌区 */}
        <div class="flex items-center gap-3 px-3 pt-8 pb-6">
          <div class="bg-base rounded-lg shadow-sm border border-surface0/60 p-1">
            <img src="/logo.png" alt="logo" class="w-7 h-7 rounded" />
          </div>
          <span class="text-base font-semibold text-text tracking-wide">{t('appName')}</span>
        </div>

        <div class="border-t border-surface0/40 mx-2 mb-2" />

        {/* 导航按钮 */}
        <div class="space-y-1">
          <For each={tabs}>
            {(tab) => (
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                classList={{
                  'text-text font-medium bg-base shadow-sm border border-surface0/60': activeTab() === tab.id,
                  'text-subtext1 hover:bg-surface0/50 hover:text-text border border-transparent': activeTab() !== tab.id,
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
      <main class="flex-1 overflow-y-auto px-8 py-8 bg-mantle/80">
        <div class="max-w-2xl mx-auto">
          <Show when={activeTab()} keyed>
            {(tab) => (
              <div class="animate-[settings-enter_0.25s_ease-out]">
                <Switch>
                  <Match when={tab === 'basic'}><BasicPane /></Match>
                  <Match when={tab === 'theme'}><ThemePane /></Match>
                  <Match when={tab === 'reading'}><ReadingPane /></Match>
                  <Match when={tab === 'typography'}><TypographyPane /></Match>
                </Switch>
              </div>
            )}
          </Show>
        </div>
      </main>
    </div>
  );
}
