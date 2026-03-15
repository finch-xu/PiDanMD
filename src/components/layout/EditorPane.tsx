import { Show, Switch, Match, createSignal, onCleanup } from 'solid-js';
import { content, setContent, filePath, editorMode, toggleEditorMode } from '~/stores/editor';
import { formatMarkdown } from '~/lib/editor/format-markdown';
import { layoutMode, cycleLayoutMode, type LayoutMode } from '~/stores/layout';
import { openSettingsWindow } from '~/lib/settings-window';
import { t } from '~/lib/i18n';
import { MarkdownViewer } from '~/components/editor/MarkdownViewer';
import { MarkdownEditor } from '~/components/editor/MarkdownEditor';
import { EditorPlaceholder } from '~/components/editor/EditorPlaceholder';
import SquarePen from 'lucide-solid/icons/square-pen';
import ScanEye from 'lucide-solid/icons/scan-eye';
import FileType from 'lucide-solid/icons/file-type';
import SlidersHorizontal from 'lucide-solid/icons/sliders-horizontal';
import Columns2 from 'lucide-solid/icons/columns-2';
import Columns3 from 'lucide-solid/icons/columns-3';
import TextAlignStart from 'lucide-solid/icons/text-align-start';
import ChartColumn from 'lucide-solid/icons/chart-column';

function LayoutIcon(props: { mode: LayoutMode }) {
  return (
    <Switch>
      <Match when={props.mode === 'files'}><Columns2 size={16} /></Match>
      <Match when={props.mode === 'reading'}><Columns3 size={16} /></Match>
      <Match when={props.mode === 'focus'}><TextAlignStart size={16} /></Match>
    </Switch>
  );
}

const btnClass = "w-7 h-7 flex items-center justify-center rounded-md text-overlay1 hover:text-text hover:bg-surface0 focus-visible:ring-1 focus-visible:ring-overlay1 focus-visible:outline-none transition-colors";

function estimateTokens(text: string): number {
  let tokens = 0;
  let asciiLetterRun = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
      asciiLetterRun++;
      if (asciiLetterRun === 4) { tokens++; asciiLetterRun = 0; }
    } else {
      if (asciiLetterRun > 0) { tokens++; asciiLetterRun = 0; }
      if (code >= 0x4e00 && code <= 0x9fff || code >= 0x3400 && code <= 0x4dbf || code >= 0xf900 && code <= 0xfaff) {
        tokens++;
      } else if (/\s/.test(ch)) {
        // whitespace — skip
      } else {
        tokens++;
      }
    }
  }
  if (asciiLetterRun > 0) tokens++;
  return tokens;
}

export function EditorPane() {
  const [statsOpen, setStatsOpen] = createSignal(false);
  let statsRef: HTMLDivElement | undefined;

  function handleStatsClickOutside(e: MouseEvent) {
    if (statsRef && !statsRef.contains(e.target as Node)) {
      setStatsOpen(false);
      stopStatsListening();
    }
  }

  function handleStatsKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setStatsOpen(false);
      stopStatsListening();
    }
  }

  const startStatsListening = () => {
    document.addEventListener('mousedown', handleStatsClickOutside);
    document.addEventListener('keydown', handleStatsKeyDown);
  };
  const stopStatsListening = () => {
    document.removeEventListener('mousedown', handleStatsClickOutside);
    document.removeEventListener('keydown', handleStatsKeyDown);
  };

  onCleanup(stopStatsListening);

  function toggleStats() {
    const next = !statsOpen();
    setStatsOpen(next);
    if (next) startStatsListening();
    else stopStatsListening();
  }

  const wordCount = () => content().split(/[\s\n]+/).filter(Boolean).length;
  const charCount = () => content().replace(/\s/g, '').length;
  const lineCount = () => (content() ? content().split('\n').length : 0);

  return (
    <div class="relative overflow-hidden">
      {/* Toolbar — fixed, not scrollable, aligned with content title */}
      <div class="absolute top-4 right-4 z-10 flex items-center gap-0.5">
        <Show when={filePath()}>
          <button
            class={btnClass}
            onClick={toggleEditorMode}
            title={editorMode() === 'preview' ? t('edit') : t('preview')}
          >
            <Show when={editorMode() === 'preview'} fallback={<ScanEye size={16} />}>
              <SquarePen size={16} />
            </Show>
          </button>
          <button
            class={btnClass}
            onClick={async () => {
              const raw = content();
              if (!raw.trim()) return;
              try {
                const formatted = await formatMarkdown(raw);
                if (formatted !== raw) setContent(formatted);
              } catch (e) {
                console.error('Format failed:', e);
              }
            }}
            title={t('formatMarkdown')}
          >
            <FileType size={16} />
          </button>
          <div ref={statsRef} class="relative">
            <button
              class={btnClass}
              onClick={toggleStats}
              title={t('stats')}
            >
              <ChartColumn size={16} />
            </button>
            <Show when={statsOpen()}>
              <div class="absolute top-full right-0 mt-1 w-48 rounded-lg border border-surface1 bg-mantle shadow-xl z-50 p-3">
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between"><span class="text-subtext0">{t('words')}</span><span class="text-text">{wordCount()}</span></div>
                  <div class="flex justify-between"><span class="text-subtext0">{t('characters')}</span><span class="text-text">{charCount()}</span></div>
                  <div class="flex justify-between"><span class="text-subtext0">{t('lines')}</span><span class="text-text">{lineCount()}</span></div>
                  <div class="flex justify-between"><span class="text-subtext0">Token</span><span class="text-text">≈ {estimateTokens(content())}</span></div>
                </div>
              </div>
            </Show>
          </div>
        </Show>
        <button
          class={btnClass}
          onClick={cycleLayoutMode}
          title={`${t('layout')}: ${layoutMode()}`}
        >
          <LayoutIcon mode={layoutMode()} />
        </button>
        <button
          class={btnClass}
          onClick={() => openSettingsWindow()}
          title={t('settings')}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div class="h-full overflow-y-auto overflow-x-hidden">
        <Show when={filePath()} fallback={<EditorPlaceholder />}>
          <Show when={editorMode() === 'edit'} fallback={<MarkdownViewer />}>
            <MarkdownEditor />
          </Show>
        </Show>
      </div>
    </div>
  );
}
