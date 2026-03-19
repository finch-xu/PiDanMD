import { EditorView } from '@codemirror/view';
import { IMAGE_FORMATS, IMAGE_EXTENSIONS, saveBase64Image, copyImageToAssets } from './image-insert';
import { filePath } from '~/stores/editor';

function insertPlaceholder(view: EditorView): string {
  const id = Math.random().toString(36).slice(2, 6);
  const placeholder = `![uploading-${id}...]()`;
  const from = view.state.selection.main.head;
  view.dispatch({ changes: { from, insert: placeholder } });
  return placeholder;
}

function replacePlaceholder(view: EditorView, placeholder: string, relativePath: string) {
  const doc = view.state.doc.toString();
  const idx = doc.indexOf(placeholder);
  if (idx === -1) return;
  view.dispatch({ changes: { from: idx, to: idx + placeholder.length, insert: `![](${relativePath})` } });
}

function removePlaceholder(view: EditorView, placeholder: string) {
  const doc = view.state.doc.toString();
  const idx = doc.indexOf(placeholder);
  if (idx === -1) return;
  view.dispatch({ changes: { from: idx, to: idx + placeholder.length } });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function withPlaceholder(view: EditorView, saveFn: () => Promise<string>) {
  const placeholder = insertPlaceholder(view);
  try {
    const relativePath = await saveFn();
    replacePlaceholder(view, placeholder, relativePath);
  } catch (e) {
    removePlaceholder(view, placeholder);
    console.error('[ImageInsert] Failed to save image:', e);
  }
}

export function imageHandlerExtension() {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const fp = filePath();
      const items = event.clipboardData?.items;
      if (!fp || !items) return false;

      for (const item of items) {
        if (item.type in IMAGE_FORMATS) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            withPlaceholder(view, async () => {
              const base64 = await readFileAsBase64(file);
              return saveBase64Image(base64, file.type, fp);
            });
            return true;
          }
        }
      }
      return false;
    },

    drop(event, view) {
      const fp = filePath();
      const files = event.dataTransfer?.files;
      if (!fp || !files || files.length === 0) return false;

      let handled = false;
      for (const file of files) {
        if (file.type in IMAGE_FORMATS) {
          handled = true;
          withPlaceholder(view, async () => {
            const base64 = await readFileAsBase64(file);
            return saveBase64Image(base64, file.type, fp);
          });
        }
      }

      if (!handled) {
        const uriList = event.dataTransfer?.getData('text/uri-list');
        if (uriList) {
          const path = decodeURIComponent(uriList.replace('file://', ''));
          const ext = path.split('.').pop()?.toLowerCase() ?? '';
          if (IMAGE_EXTENSIONS.has(ext)) {
            handled = true;
            withPlaceholder(view, () => copyImageToAssets(path, fp));
          }
        }
      }

      if (handled) event.preventDefault();
      return handled;
    },
  });
}
