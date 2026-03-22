// Jekyll blog mode preprocessor
// Transforms Jekyll Liquid tags into standard Markdown.
// Front matter uses the shared blog-frontmatter module.

import {
  escapeHtml,
  extractYamlFrontmatter,
  parseYamlFrontmatter,
  renderFrontmatterCard,
} from './blog-frontmatter';

// ── Raw Block Protection ─────────────────────

function extractRawBlocks(body: string): { body: string; blocks: string[] } {
  const blocks: string[] = [];
  const result = body.replace(/\{%\s*raw\s*%\}([\s\S]*?)\{%\s*endraw\s*%\}/g, (_, content) => {
    blocks.push(content);
    return `<!--raw-block-${blocks.length - 1}-->`;
  });
  return { body: result, blocks };
}

function restoreRawBlocks(body: string, blocks: string[]): string {
  return body.replace(/<!--raw-block-(\d+)-->/g, (_, idx) => blocks[parseInt(idx)] ?? '');
}

// ── Liquid Tag Transforms ────────────────────

// {% highlight language [linenos] %}...{% endhighlight %}
function transformHighlight(body: string): string {
  return body.replace(
    /\{%\s*highlight\s+(\w+)(?:\s+linenos)?\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
    (_, lang: string, content: string) => {
      return '```' + lang + '\n' + content.trim() + '\n```';
    },
  );
}

// {% post_url 2024-01-15-my-post %}
function transformPostUrl(body: string): string {
  return body.replace(
    /\{%\s*post_url\s+(\S+)\s*%\}/g,
    (_, slug: string) => {
      return `[${slug}](${slug})`;
    },
  );
}

// {% link page.md %} or {% link /path/to/page.md %}
function transformLinkTag(body: string): string {
  return body.replace(
    /\{%\s*link\s+(\S+)\s*%\}/g,
    (_, page: string) => {
      const name = page.replace(/\.md$|\.markdown$|\.html$/, '').split('/').pop() ?? page;
      return `[${name}](${page})`;
    },
  );
}

// {% include file.html %} — render as a placeholder
function transformInclude(body: string): string {
  return body.replace(
    /\{%\s*include\s+(\S+)\s*%\}/g,
    (_, file: string) => {
      return `\`{% include ${file} %}\``;
    },
  );
}

// ── Main Pipeline ────────────────────────────

function transformJekyllTags(body: string): string {
  const { body: withoutRaw, blocks } = extractRawBlocks(body);

  let result = withoutRaw;
  result = transformHighlight(result);
  result = transformPostUrl(result);
  result = transformLinkTag(result);
  result = transformInclude(result);

  result = restoreRawBlocks(result, blocks);
  return result;
}

export function preprocessJekyll(markdown: string): { frontmatterHtml: string; body: string } {
  let frontmatterHtml = '';
  let body = markdown;

  const { raw, body: rest } = extractYamlFrontmatter(markdown);
  if (raw) {
    frontmatterHtml = renderFrontmatterCard(parseYamlFrontmatter(raw));
    body = rest;
  }

  body = transformJekyllTags(body);
  return { frontmatterHtml, body };
}
