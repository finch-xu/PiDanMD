import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const theme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--ctp-text)',
    fontSize: 'calc(var(--editor-font-size, 16) * 1px)',
    fontFamily: 'var(--editor-font-body)',
  },
  '.cm-content': {
    padding: '1rem 1.5rem',
    lineHeight: 'var(--editor-line-height-body, 1.9)',
    caretColor: 'var(--ctp-text)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--ctp-text)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    background: 'color-mix(in srgb, var(--ctp-overlay1) 25%, transparent) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--ctp-surface0) 30%, transparent)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--ctp-overlay0)',
    border: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    paddingLeft: '0.5rem',
    paddingRight: '0.75rem',
    fontSize: '0.85em',
    minWidth: '2.5rem',
  },
  '&.cm-focused': { outline: 'none' },
});

const highlightStyle = HighlightStyle.define([
  { tag: tags.heading1, color: 'var(--ctp-overlay1)', fontWeight: '600', fontSize: '1.5em' },
  { tag: tags.heading2, color: 'var(--ctp-overlay1)', fontWeight: '500', fontSize: '1.3em' },
  { tag: tags.heading3, color: 'var(--ctp-overlay1)', fontWeight: '500', fontSize: '1.15em' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], color: 'var(--ctp-overlay1)', fontWeight: '500' },
  { tag: tags.strong, color: 'var(--ctp-peach)', fontWeight: '600' },
  { tag: tags.emphasis, color: 'var(--ctp-yellow)', fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--ctp-overlay0)' },
  { tag: tags.link, color: 'var(--ctp-blue)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--ctp-blue)' },
  { tag: tags.monospace, color: 'var(--ctp-green)', fontFamily: 'var(--editor-font-code)' },
  { tag: tags.quote, color: 'var(--ctp-subtext1)', fontStyle: 'italic' },
  { tag: tags.list, color: 'var(--ctp-teal)' },
  { tag: [tags.processingInstruction, tags.meta], color: 'var(--ctp-overlay1)' },
]);

export const catppuccinTheme = [theme, syntaxHighlighting(highlightStyle)];
