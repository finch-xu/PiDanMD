import { createSignal } from 'solid-js';
import { readFile, writeFile } from '~/lib/tauri/commands';
import { debounce } from '~/lib/utils/debounce';

const [content, setContentRaw] = createSignal('');
const [filePath, setFilePath] = createSignal<string | null>(null);
const [isDirty, setIsDirty] = createSignal(false);
const [isLoading, setIsLoading] = createSignal(false);
const [editorMode, setEditorMode] = createSignal<'preview' | 'edit'>('preview');

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

async function saveFile() {
  const path = filePath();
  if (!path) return;
  await writeFile(path, content());
  setIsDirty(false);
}

export { content, filePath, isDirty, isLoading, loadFile, setContent, editorMode, toggleEditorMode, saveFile };
