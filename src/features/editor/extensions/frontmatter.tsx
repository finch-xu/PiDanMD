import { Node, type JSONContent } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { renderFrontmatter, tokenizeFrontmatter } from "~/lib/markdown-serde";

/** Parse simple YAML key-value pairs (handles strings, arrays, nested keys) */
function parseSimpleYaml(yaml: string): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  for (const line of yaml.split("\n")) {
    const match = line.match(/^(\s*)([^#:\s][^:]*):\s*(.*)/);
    if (match) {
      const indent = match[1];
      const key = match[2].trim();
      const value = match[3].trim();
      if (indent.length === 0) {
        entries.push([key, value]);
      }
    }
  }
  return entries;
}

function FrontmatterView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(node.attrs.data as string);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setData(node.attrs.data);
  }, [node.attrs.data]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="frontmatter-card frontmatter-card--editing">
          <textarea
            ref={textareaRef}
            className="frontmatter-card__input"
            value={data}
            onChange={(e) => setData(e.target.value)}
            onBlur={() => {
              updateAttributes({ data });
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                updateAttributes({ data });
                setEditing(false);
              }
            }}
            rows={Math.max(3, data.split("\n").length)}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  const entries = parseSimpleYaml(data);

  return (
    <NodeViewWrapper>
      <div
        className={cn("frontmatter-card", selected && "frontmatter-card--selected")}
        onDoubleClick={() => setEditing(true)}
      >
        {entries.length > 0 ? (
          <table className="frontmatter-card__table">
            <tbody>
              {entries.map(([key, value], i) => (
                <tr key={i}>
                  <td className="frontmatter-card__key">{key}</td>
                  <td className="frontmatter-card__value">{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="frontmatter-card__empty">
            <code>{data || "(empty frontmatter)"}</code>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const Frontmatter = Node.create({
  name: "frontmatter",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      data: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="frontmatter"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-type": "frontmatter" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FrontmatterView);
  },

  markdownTokenizer: {
    name: "frontmatter",
    level: "block" as const,
    start: (src: string) => (src.startsWith("---") ? 0 : -1),
    tokenize(src: string, tokens: any[]) {
      // Frontmatter 只在文档最开头允许（之前必须无 token）
      if (tokens.length > 0) return;
      return tokenizeFrontmatter(src);
    },
  },

  markdownTokenName: "frontmatter",

  parseMarkdown(token: any) {
    return {
      type: "frontmatter",
      attrs: { data: token.text },
    } as JSONContent;
  },

  renderMarkdown(node: JSONContent) {
    return renderFrontmatter({ data: node.attrs?.data });
  },
});
