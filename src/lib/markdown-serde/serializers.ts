// Markdown 序列化的"权威定义"——纯函数、可独立测试。
// Tiptap extension 的 renderMarkdown 都委托给这里，避免 fix 时漏改一处。

export function renderMathInline(attrs: { latex?: string }): string {
  return `$${attrs.latex ?? ""}$`;
}

export function renderMathBlock(attrs: { latex?: string }): string {
  return `$$\n${attrs.latex ?? ""}\n$$`;
}

export function renderMermaidBlock(attrs: { code?: string }): string {
  return "```mermaid\n" + (attrs.code ?? "") + "\n```";
}

export function renderFrontmatter(attrs: { data?: string }): string {
  return `---\n${attrs.data ?? ""}\n---`;
}

export function renderSuperscript(inner: string): string {
  return `<sup>${inner}</sup>`;
}

export function renderSubscript(inner: string): string {
  return `<sub>${inner}</sub>`;
}
