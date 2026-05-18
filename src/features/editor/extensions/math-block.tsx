import { Node, type JSONContent } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import "katex/dist/katex.min.css";
import { cn } from "~/lib/utils";
import {
  findMathBlockStart,
  tokenizeMathBlock,
  renderMathBlock,
} from "~/lib/markdown-serde";

function MathBlockView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex as string);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLatex(node.attrs.latex);
  }, [node.attrs.latex]);

  useEffect(() => {
    if (editing || !containerRef.current) return;
    const el = containerRef.current;
    let cancelled = false;
    import("katex").then((m) => {
      if (cancelled) return;
      try {
        m.default.render(latex, el, { displayMode: true, throwOnError: false });
      } catch {
        el.textContent = latex;
      }
    });
    return () => { cancelled = true; };
  }, [latex, editing]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="math-block math-block--editing">
          <textarea
            ref={textareaRef}
            className="math-block__input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onBlur={() => {
              updateAttributes({ latex });
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                updateAttributes({ latex });
                setEditing(false);
              }
            }}
            rows={Math.max(2, latex.split("\n").length)}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        className={cn("math-block", selected && "math-block--selected")}
        onDoubleClick={() => setEditing(true)}
        ref={containerRef}
      />
    </NodeViewWrapper>
  );
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "math-block" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  markdownTokenizer: {
    name: "mathBlock",
    level: "block" as const,
    start: findMathBlockStart,
    tokenize: tokenizeMathBlock,
  },

  markdownTokenName: "mathBlock",

  parseMarkdown(token: any) {
    return {
      type: "mathBlock",
      attrs: { latex: token.text },
    } as JSONContent;
  },

  renderMarkdown(node: JSONContent) {
    return renderMathBlock({ latex: node.attrs?.latex });
  },
});
