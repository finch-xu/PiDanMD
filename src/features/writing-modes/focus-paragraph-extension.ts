import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { useWritingModeStore } from "./store";

// 给当前光标所在的顶层 block 节点加 .has-focus class；CSS 控制其他段落 opacity。
// 仅在 store.focusParagraph 启用时才工作；并通过 tr 短路避免每键重算。

const focusParagraphKey = new PluginKey("focusParagraph");

function buildDecorations(state: import("@tiptap/pm/state").EditorState): DecorationSet {
  if (!useWritingModeStore.getState().focusParagraph) return DecorationSet.empty;

  const { $from } = state.selection;
  if ($from.depth < 1) return DecorationSet.empty;

  const start = $from.before(1);
  const node = $from.node(1);
  return DecorationSet.create(state.doc, [
    Decoration.node(start, start + node.nodeSize, { class: "has-focus" }),
  ]);
}

export const FocusParagraph = Extension.create({
  name: "focusParagraph",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: focusParagraphKey,
        state: {
          init: (_, state) => buildDecorations(state),
          apply: (tr, old, _oldState, newState) => {
            // 只在选区/文档变化时重算——避免每次 metadata-only tr 都跑
            if (!tr.docChanged && !tr.selectionSet) return old;
            return buildDecorations(newState);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
