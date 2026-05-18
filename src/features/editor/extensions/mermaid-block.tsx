import { Node, type JSONContent } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "~/lib/utils";
import { renderMermaidBlock } from "~/lib/markdown-serde";
import { useSettingsStore } from "~/stores/settings-store";

// Mermaid lib 懒加载 + 主题级 initialize 缓存。
// initialize 是全局 side effect，多个 instance 各跑会互相覆盖配置；
// 改成同一主题只 initialize 一次，主题变化时重置 lastTheme 标志。
let mermaidPromise: Promise<typeof import("mermaid")["default"]> | null = null;
let lastInitTheme: "default" | "dark" | null = null;

async function getInitializedMermaid(dark: boolean) {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  const mermaid = await mermaidPromise;
  const theme = dark ? "dark" : "default";
  if (lastInitTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme,
    });
    lastInitTheme = theme;
  }
  return mermaid;
}

let renderIdCounter = 0;

function parseSvgString(svgString: string): SVGElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  if (doc.querySelector("parsererror")) return null;
  return doc.documentElement as unknown as SVGElement;
}

function MermaidBlockView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(node.attrs.code as string);
  const [error, setError] = useState("");
  const svgRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 跟随主题：当前 resolvedMode 是 dark/light，重渲染所有 mermaid 图
  const isDark = useSettingsStore((s) => s.resolvedMode === "dark");

  const renderDiagram = useCallback(
    async (source: string, dark: boolean) => {
      if (!source.trim()) {
        if (svgRef.current) svgRef.current.replaceChildren();
        setError("");
        return;
      }
      try {
        const mermaid = await getInitializedMermaid(dark);
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
        setError(e?.message || "Mermaid 渲染错误");
        if (svgRef.current) svgRef.current.replaceChildren();
      }
    },
    []
  );

  useEffect(() => {
    setCode(node.attrs.code);
  }, [node.attrs.code]);

  // code 或主题变化都触发重渲染（修主题切换竞态 issue）
  useEffect(() => {
    if (!editing) {
      renderDiagram(code, isDark);
    }
  }, [code, editing, isDark, renderDiagram]);

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
    // 兼容不同 markdown parser 给 lang 字段不同名字（lang / info）
    const lang = (token.lang ?? token.info ?? "").toString().trim().toLowerCase();
    if (lang !== "mermaid") return null;
    return {
      type: "mermaidBlock",
      attrs: { code: token.text },
    };
  },

  renderMarkdown(node: JSONContent) {
    return renderMermaidBlock({ code: node.attrs?.code });
  },
});
