import { createSignal } from 'solid-js';
import { readFile, writeFile } from '~/lib/tauri/commands';
import { debounce } from '~/lib/utils/debounce';
import type { AppConfig } from '~/lib/config-persistence';
import { updateAndSave } from '~/lib/config-persistence';

const [content, setContentRaw] = createSignal('');
const [filePath, setFilePath] = createSignal<string | null>(null);
const [isDirty, setIsDirty] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [editorMode, setEditorMode] = createSignal<'preview' | 'edit'>('preview');

export type RenderingMode = 'default' | 'hexo' | 'jekyll' | 'hugo' | 'skill';
const VALID_MODES: RenderingMode[] = ['default', 'hexo', 'jekyll', 'hugo', 'skill'];
const [renderingMode, setRenderingModeRaw] = createSignal<RenderingMode>('default');

async function loadFile(path: string, initialMode: 'preview' | 'edit' = 'preview') {
  setIsLoading(true);
  try {
    const text = await readFile(path);
    setContentRaw(text);
    setFilePath(path);
    setIsDirty(false);
    setEditorMode(initialMode);
  } finally {
    setIsLoading(false);
  }
}

const debouncedSave = debounce(() => {
  if (isDirty() && filePath()) saveFile();
}, 1000);

function setContent(newContent: string) {
  setContentRaw(newContent);
  setIsDirty(true);
  debouncedSave();
}

function toggleEditorMode() {
  setEditorMode((m) => (m === 'preview' ? 'edit' : 'preview'));
}

function clearEditor() {
  setContentRaw('');
  setFilePath(null);
  setIsDirty(false);
}

async function saveFile() {
  const path = filePath();
  if (!path) return;
  await writeFile(path, content());
  setIsDirty(false);
}

export function initRenderingModeFromConfig(config: AppConfig) {
  const mode = config.reading.renderingMode as RenderingMode;
  if (VALID_MODES.includes(mode)) setRenderingModeRaw(mode);
}

export function setRenderingMode(mode: RenderingMode) {
  setRenderingModeRaw(mode);
  updateAndSave((c) => { c.reading.renderingMode = mode; });
}

export { content, filePath, isDirty, isLoading, loadFile, setContent, editorMode, toggleEditorMode, saveFile, clearEditor, setFilePath, renderingMode };
