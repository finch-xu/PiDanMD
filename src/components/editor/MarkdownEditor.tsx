import { createCodeMirror, createEditorControlledValue } from 'solid-codemirror';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { content, setContent } from '~/stores/editor';
import { catppuccinTheme } from '~/lib/editor/codemirror-theme';

export function MarkdownEditor() {
  const { ref, editorView, createExtension } = createCodeMirror({
    onValueChange: (value) => setContent(value),
  });

  createExtension([
    markdown(),
    ...catppuccinTheme,
    keymap.of([indentWithTab, ...defaultKeymap]),
    EditorView.lineWrapping,
    lineNumbers(),
  ]);

  createEditorControlledValue(editorView, () => content());

  return <div ref={ref} class="cm-editor-wrapper" />;
}
