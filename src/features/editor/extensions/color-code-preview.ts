import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PmNode, Schema } from "@tiptap/pm/model";

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const pluginKey = new PluginKey("colorCodePreview");

function isValidHexColor(hex: string): boolean {
  const len = hex.length - 1; // minus the '#'
  return len === 3 || len === 4 || len === 6 || len === 8;
}

function buildDecorations(doc: PmNode, schema: Schema): DecorationSet {
  const codeMark = schema.marks.code;
  if (!codeMark) return DecorationSet.empty;

  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;

    const hasCode = node.marks.some((m) => m.type === codeMark);
    if (!hasCode) return;

    HEX_COLOR_RE.lastIndex = 0;
    let match;
    while ((match = HEX_COLOR_RE.exec(node.text)) !== null) {
      const color = match[0];
      if (!isValidHexColor(color)) continue;

      const widgetPos = pos + match.index + color.length;

      const deco = Decoration.widget(
        widgetPos,
        () => {
          const swatch = document.createElement("span");
          swatch.style.display = "inline-block";
          swatch.style.width = "0.7em";
          swatch.style.height = "0.7em";
          swatch.style.borderRadius = "2px";
          swatch.style.backgroundColor = color;
          swatch.style.marginLeft = "0.2em";
          swatch.style.verticalAlign = "middle";
          swatch.style.border = "1px solid rgba(0,0,0,0.15)";
          swatch.contentEditable = "false";
          return swatch;
        },
        { side: 1 }
      );

      decorations.push(deco);
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const ColorCodePreview = Extension.create({
  name: "colorCodePreview",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init(_, state) {
            return buildDecorations(state.doc, state.schema);
          },
          apply(tr, oldDecorations, _oldState, newState) {
            if (!tr.docChanged) return oldDecorations;
            return buildDecorations(newState.doc, newState.schema);
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
