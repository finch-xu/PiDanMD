import { useEffect, useRef } from "react";
import { EditorView, lineNumbers, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
  HighlightStyle,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useEditorStore } from "~/stores/editor-store";
import { useSettingsStore } from "~/stores/settings-store";

const darkHighlight = HighlightStyle.define([
  { tag: tags.heading1, color: "#569cd6", fontWeight: "bold" },
  { tag: tags.heading2, color: "#569cd6", fontWeight: "bold" },
  { tag: tags.heading3, color: "#569cd6", fontWeight: "bold" },
  { tag: tags.heading4, color: "#569cd6" },
  { tag: tags.heading5, color: "#569cd6" },
  { tag: tags.heading6, color: "#569cd6" },
  { tag: tags.strong, color: "#ce9178", fontWeight: "bold" },
  { tag: tags.emphasis, color: "#dcdcaa", fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "#4fc1ff" },
  { tag: tags.url, color: "#4fc1ff", textDecoration: "underline" },
  { tag: tags.monospace, color: "#d7ba7d" },
  { tag: tags.quote, color: "#808080" },
  { tag: tags.meta, color: "#808080" },
  { tag: tags.processingInstruction, color: "#808080" },
]);

function buildTheme(isDark: boolean) {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: "var(--editor-code-font-size, 14px)",
      },
      ".cm-scroller": {
        fontFamily: "var(--editor-font-code, monospace)",
        lineHeight: "var(--editor-line-height, 1.9)",
        padding: "1rem 0",
      },
      ".cm-content": {
        padding: "0 1rem",
      },
      ".cm-gutters": {
        border: "none",
        background: "transparent",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        minWidth: "3em",
        color: isDark ? "#555" : "#bbb",
      },
      ".cm-activeLine": {
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
      },
      ".cm-activeLineGutter": {
        background: "transparent",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: isDark ? "#d4d4d4" : "#333",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        background: isDark ? "rgba(100,150,255,0.2)" : "rgba(100,150,255,0.15)",
      },
    },
    { dark: isDark }
  );
}

interface SourceEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function SourceEditor({ content, onChange }: SourceEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const filePath = useEditorStore((s) => s.filePath);
  const isDark = useSettingsStore((s) => s.resolvedMode === "dark");

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        history(),
        indentOnInput(),
        bracketMatching(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        isDark
          ? syntaxHighlighting(darkHighlight)
          : syntaxHighlighting(defaultHighlightStyle),
        buildTheme(isDark),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Recreate when theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // Sync content when file changes (not on every keystroke)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      });
    }
  }, [filePath, content]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden"
      style={{ background: isDark ? "#1e1e1e" : "#fff" }}
    />
  );
}
