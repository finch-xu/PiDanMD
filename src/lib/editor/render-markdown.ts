import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { codeToHtml, type BundledTheme } from 'shiki';
import { headingToId } from './heading-id';

// Extend default sanitization schema to allow KaTeX and code block classes
const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.div ?? []), 'className', 'style'],
    math: ['xmlns'],
    annotation: ['encoding'],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
    'mfrac', 'mover', 'munder', 'msqrt', 'mtext', 'mspace', 'annotation',
  ],
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

// Map app theme → Shiki built-in theme
const SHIKI_THEME_MAP: Record<string, BundledTheme> = {
  mocha: 'catppuccin-mocha',
  latte: 'catppuccin-latte',
  frappe: 'catppuccin-frappe',
  macchiato: 'catppuccin-macchiato',
  light: 'github-light',
  dark: 'github-dark',
};

const CODE_BLOCK_RE = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
const HEADING_RE = /<(h[1-6])>([\s\S]*?)<\/h[1-6]>/g;
const HTML_TAG_RE = /<[^>]+>/g;
const COLOR_CODE_RE = /<code>(#[0-9a-fA-F]{3,8})<\/code>/g;
const TABLE_RE = /<table(?! class="frontmatter-table")[^>]*>[\s\S]*?<\/table>/g;

function getPlainTextFromHtml(html: string): string {
  return decodeHtmlEntities(html.replace(HTML_TAG_RE, ''));
}

function addHeadingIds(html: string): string {
  return html.replace(HEADING_RE, (match, tag, inner) => {
    const text = getPlainTextFromHtml(inner).trim();
    const id = headingToId(text);
    return `<${tag} id="${escapeHtml(id)}">${inner}</${tag}>`;
  });
}

function addColorSwatches(html: string): string {
  return html.replace(COLOR_CODE_RE, (_, color) => {
    return `<code><span class="color-swatch" style="background-color: ${color};"></span>${color}</code>`;
  });
}

function wrapTables(html: string): string {
  return html.replace(TABLE_RE, (match) => `<div class="table-wrapper">${match}</div>`);
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const HTML_ENTITY_RE = /&amp;|&lt;|&gt;|&quot;|&#39;/g;

function decodeHtmlEntities(html: string): string {
  return html.replace(HTML_ENTITY_RE, (match) => HTML_ENTITY_MAP[match]);
}

function extractFrontmatter(markdown: string): { frontmatter: Record<string, string> | null; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: null, body: markdown };

  const raw = match[1];
  const fields: Record<string, string> = {};
  let currentKey = '';
  for (const line of raw.split('\n')) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      fields[currentKey] = kvMatch[2].trim();
    } else if (currentKey && line.trim()) {
      fields[currentKey] += ' ' + line.trim();
    }
  }

  const body = markdown.slice(match[0].length).replace(/^\r?\n/, '');
  return { frontmatter: fields, body };
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderFrontmatterTable(fields: Record<string, string>): string {
  const rows = Object.entries(fields)
    .map(([key, value]) => `<tr><td class="fm-key">${escapeHtml(key)}</td><td class="fm-value">${escapeHtml(value)}</td></tr>`)
    .join('');
  return `<table class="frontmatter-table"><tbody>${rows}</tbody></table>`;
}

export async function renderMarkdown(markdown: string, resolvedTheme?: string, fileName?: string): Promise<string> {
  let fmHtml = '';
  let md = markdown;

  if (fileName === 'SKILL.md') {
    const { frontmatter, body } = extractFrontmatter(markdown);
    if (frontmatter) {
      fmHtml = renderFrontmatterTable(frontmatter);
      md = body;
    }
  }

  const result = await processor.process(md);
  let html = String(result);

  html = addHeadingIds(html);
  html = addColorSwatches(html);
  html = wrapTables(html);

  const matches = [...html.matchAll(CODE_BLOCK_RE)];
  if (matches.length === 0) return fmHtml + html;

  const shikiTheme = SHIKI_THEME_MAP[resolvedTheme ?? 'mocha'] ?? 'catppuccin-mocha';

  const highlighted = await Promise.all(
    matches.map(async ([fullMatch, lang, encodedCode]) => {
      const code = decodeHtmlEntities(encodedCode);
      try {
        return { fullMatch, result: await codeToHtml(code, { lang, theme: shikiTheme }) };
      } catch (e) {
        console.warn(`[Shiki] highlight failed for "${lang}":`, e);
        return { fullMatch, result: fullMatch };
      }
    }),
  );

  for (const { fullMatch, result: replacement } of highlighted) {
    html = html.replace(fullMatch, replacement);
  }

  return fmHtml + html;
}
