import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkStringify from 'remark-stringify';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

// 递归遍历 text 节点，跳过 code/math/html
function applyPanguSpacing(node: any): void {
  const skip = new Set(['code', 'inlineCode', 'math', 'inlineMath', 'html']);
  if (skip.has(node.type)) return;
  if (node.type === 'text') {
    node.value = node.value
      .replace(/([\u4e00-\u9fff\u3400-\u4dbf])([A-Za-z0-9])/g, '$1 $2')
      .replace(/([A-Za-z0-9])([\u4e00-\u9fff\u3400-\u4dbf])/g, '$1 $2');
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) applyPanguSpacing(child);
  }
}

const remarkPangu: Plugin<[], Root> = () => (tree: Root) => { applyPanguSpacing(tree); };

const formatter = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkPangu)
  .use(remarkStringify, {
    bullet: '-',
    bulletOrdered: '.',
    emphasis: '*',
    strong: '*',
    rule: '-',
    listItemIndent: 'one',
  });

export async function formatMarkdown(markdown: string): Promise<string> {
  const result = await formatter.process(markdown);
  return String(result);
}
