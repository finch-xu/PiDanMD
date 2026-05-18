// Markdown tokenizer 纯函数：输入 markdown 片段，返回 token。
// 抽出来是为了能 unit test 不用拉 Tiptap 编辑器。

export interface InlineMathToken {
  type: "mathInline";
  raw: string;
  text: string;
}

export interface BlockMathToken {
  type: "mathBlock";
  raw: string;
  text: string;
}

export interface FrontmatterToken {
  type: "frontmatter";
  raw: string;
  text: string;
}

/** 行内公式：`$E=mc^2$`。不匹配 `$$...$$`（那是 block math） */
export function tokenizeMathInline(src: string): InlineMathToken | undefined {
  if (src.startsWith("$$")) return undefined;
  const match = src.match(/^\$([^\$\n]+?)\$/);
  if (!match) return undefined;
  return { type: "mathInline", raw: match[0], text: match[1] };
}

/**
 * 行内公式 start 位置：找下一个孤立的 $（不是 $$ 块的一部分）。
 *
 * 关键修复（与旧实现相比）：必须跳过整个 $$...$$ 块，
 * 否则会找到块内的 $ 让 marked 误以为是 inline math 起点，
 * 接着 inline tokenize 看到 $$ 又跳过，导致 LaTeX 公式被吃成纯文本（issue #27）。
 */
export function findMathInlineStart(src: string): number {
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf("$", i);
    if (idx < 0) return -1;
    if (src[idx + 1] === "$") {
      // $$ block math：跳到匹配的结束 $$ 之后
      const endIdx = src.indexOf("$$", idx + 2);
      if (endIdx < 0) return -1; // 未闭合，整段无效
      i = endIdx + 2;
      continue;
    }
    return idx;
  }
  return -1;
}

/**
 * 块级公式：`$$\nE=mc^2\n$$` 或 `$$E=mc^2$$`（单行）。
 * 注意 lazy match：保证多个 block math 不会被一次匹配吃掉。
 */
export function tokenizeMathBlock(src: string): BlockMathToken | undefined {
  // 支持单行 $$ ... $$ 和多行 $$\n...\n$$
  const match = src.match(/^\$\$\s*\n?([\s\S]+?)\n?\s*\$\$/);
  if (!match) return undefined;
  return { type: "mathBlock", raw: match[0], text: match[1].trim() };
}

export function findMathBlockStart(src: string): number {
  return src.indexOf("$$");
}

/**
 * Frontmatter：只匹配文档最开头的 `---\n...\n---\n`。
 * 由调用方负责检查"是否在文档最开头"。
 */
export function tokenizeFrontmatter(src: string): FrontmatterToken | undefined {
  const match = src.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return undefined;
  return { type: "frontmatter", raw: match[0], text: match[1] };
}
