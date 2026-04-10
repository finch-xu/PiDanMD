import { Node, type JSONContent } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "~/lib/utils";

let mermaidInstance: typeof import("mermaid")["default"] | null = null;
let lastTheme: string | null = null;
let renderIdCounter = 0;

async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import("mermaid");
    mermaidInstance = m.default;
  }
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "default";
  if (lastTheme !== theme) {
    mermaidInstance.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme,
    });
    lastTheme = theme;
  }
  return mermaidInstance;
}

/**
 * Safely parse SVG string into a DOM element using DOMParser.
 * Mermaid with securityLevel:"strict" already sanitizes output.
 */
function parseSvgString(svgString: string): SVGElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) return null;
  return doc.documentElement as unknown as SVGElement;
}

function MermaidBlockView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(node.attrs.code as string);
  const [error, setError] = useState("");
  const svgRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderDiagram = useCallback(async (source: string) => {
    try {
      const mermaid = await getMermaid();
      const id = `mermaid-${++renderIdCounter}`;
      const { svg } = await mermaid.render(id, source);
      document.getElementById(id)?.remove();
      if (svgRef.current) {
        const svgEl = parseSvgString(svg);
        if (svgEl) {
          const imported = svgRef.current.ownerDocument.importNode(svgEl, true);
          svgRef.current.replaceChildren(imported);
        } else {
          svgRef.current.replaceChildren();
        }
      }
      setError("");
    } catch (e: any) {
      setError(e.message || "Mermaid render error");
      if (svgRef.current) svgRef.current.replaceChildren();
    }
  }, []);

  useEffect(() => {
    setCode(node.attrs.code);
  }, [node.attrs.code]);

  useEffect(() => {
    if (!editing) {
      renderDiagram(code);
    }
  }, [code, editing, renderDiagram]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="mermaid-block mermaid-block--editing">
          <textarea
            ref={textareaRef}
            className="mermaid-block__input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => {
              updateAttributes({ code });
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                updateAttributes({ code });
                setEditing(false);
              }
            }}
            rows={Math.max(4, code.split("\n").length)}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        className={cn("mermaid-block", selected && "mermaid-block--selected")}
        onDoubleClick={() => setEditing(true)}
      >
        <div className="mermaid-block__svg" ref={svgRef} />
        {error && (
          <div className="mermaid-block__error">
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const MermaidBlock = Node.create({
  name: "mermaidBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      code: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "mermaid-block" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockView);
  },

  markdownTokenName: "code",

  parseMarkdown(token: any): any {
    if (token.lang !== "mermaid") return null;
    return {
      type: "mermaidBlock",
      attrs: { code: token.text },
    };
  },

  renderMarkdown(node: JSONContent) {
    return "```mermaid\n" + (node.attrs?.code ?? "") + "\n```";
  },
});
