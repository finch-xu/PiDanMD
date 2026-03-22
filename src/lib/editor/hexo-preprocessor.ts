// Hexo blog mode preprocessor
// Transforms Hexo tag plugins into standard Markdown or HTML placeholders.
// Front matter parsing is delegated to the shared blog-frontmatter module.

import {
  type BlogFrontmatter,
  escapeHtml,
  extractYamlFrontmatter,
  parseYamlFrontmatter,
  renderFrontmatterCard,
} from './blog-frontmatter';

// ── Tag Plugin Transforms ────────────────────

// {% raw %}...{% endraw %} — protect content from further processing
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

// {% codeblock [title] [lang:language] %}...{% endcodeblock %}
function transformCodeblocks(body: string): string {
  return body.replace(
    /\{%\s*(?:codeblock|code)\s*(.*?)\s*%\}([\s\S]*?)\{%\s*end(?:codeblock|code)\s*%\}/g,
    (_, args: string, content: string) => {
      const langMatch = args.match(/lang:(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      const title = args.replace(/lang:\w+/, '').trim();

      let result = '';
      if (title) {
        result += `<div class="hexo-codeblock-title">${escapeHtml(title)}</div>\n`;
      }
      result += '```' + lang + '\n' + content.trim() + '\n```';
      return result;
    },
  );
}

// {% blockquote [author[, source]] [link] %}...{% endblockquote %}
function transformBlockquotes(body: string): string {
  return body.replace(
    /\{%\s*blockquote\s*(.*?)\s*%\}([\s\S]*?)\{%\s*endblockquote\s*%\}/g,
    (_, args: string, content: string) => {
      const lines = content.trim().split('\n').map((l: string) => `> ${l}`);
      if (args.trim()) {
        lines.push('>');
        lines.push(`> — ${args.trim()}`);
      }
      return lines.join('\n');
    },
  );
}

// {% img [class names] /path/to/image [width] [height] ["title" ["alt"]] %}
function transformImg(body: string): string {
  return body.replace(
    /\{%\s*img\s+(.*?)\s*%\}/g,
    (_, args: string) => {
      const quoted: string[] = [];
      const cleaned = args.replace(/"([^"]*)"/g, (_, q: string) => { quoted.push(q); return ''; });
      const parts = cleaned.trim().split(/\s+/).filter(Boolean);

      const pathIdx = parts.findIndex((p) => p.startsWith('/') || p.startsWith('http'));
      const src = pathIdx >= 0 ? parts[pathIdx] : parts[0] ?? '';
      const title = quoted[0] ?? '';
      const alt = quoted[1] ?? title;

      return `![${alt}](${src}${title ? ` "${title}"` : ''})`;
    },
  );
}

// {% asset_img filename [title] %}
function transformAssetImg(body: string): string {
  return body.replace(
    /\{%\s*asset_img\s+(\S+)(?:\s+(.*?))?\s*%\}/g,
    (_, filename: string, title?: string) => {
      const alt = title?.trim() ?? '';
      return `![${alt}](${filename})`;
    },
  );
}

// {% link text url [title] %}
function transformLink(body: string): string {
  return body.replace(
    /\{%\s*link\s+(.+?)\s+(https?:\/\/\S+)(?:\s+(.*?))?\s*%\}/g,
    (_, text: string, url: string, title?: string) => {
      return `[${text.trim()}](${url}${title?.trim() ? ` "${title.trim()}"` : ''})`;
    },
  );
}

// {% youtube video_id [type] %}
function transformYoutube(body: string): string {
  return body.replace(
    /\{%\s*youtube\s+(\S+)(?:\s+\S+)?\s*%\}/g,
    (_, videoId: string) => {
      return `<div class="blog-youtube" data-id="${escapeHtml(videoId)}"></div>`;
    },
  );
}

// {% iframe url [width] [height] %}
function transformIframe(body: string): string {
  return body.replace(
    /\{%\s*iframe\s+(\S+)(?:\s+(\d+))?(?:\s+(\d+))?\s*%\}/g,
    (_, url: string, width?: string, height?: string) => {
      const attrs = [
        `data-src="${escapeHtml(url)}"`,
        width ? `data-width="${width}"` : '',
        height ? `data-height="${height}"` : '',
      ].filter(Boolean).join(' ');
      return `<div class="blog-iframe" ${attrs}></div>`;
    },
  );
}

// {% pullquote [class] %}...{% endpullquote %}
function transformPullquote(body: string): string {
  return body.replace(
    /\{%\s*pullquote(?:\s+\S+)?\s*%\}([\s\S]*?)\{%\s*endpullquote\s*%\}/g,
    (_, content: string) => {
      return `<div class="hexo-pullquote">${escapeHtml(content.trim())}</div>`;
    },
  );
}

// ── Main Pipeline ────────────────────────────

function transformTagPlugins(body: string): string {
  const { body: withoutRaw, blocks } = extractRawBlocks(body);

  let result = withoutRaw;
  result = transformCodeblocks(result);
  result = transformBlockquotes(result);
  result = transformImg(result);
  result = transformAssetImg(result);
  result = transformLink(result);
  result = transformYoutube(result);
  result = transformIframe(result);
  result = transformPullquote(result);

  result = restoreRawBlocks(result, blocks);
  return result;
}

export function preprocessHexo(markdown: string, _filePath?: string): { frontmatterHtml: string; body: string } {
  let frontmatterHtml = '';
  let body = markdown;

  const { raw, body: rest } = extractYamlFrontmatter(markdown);
  if (raw) {
    frontmatterHtml = renderFrontmatterCard(parseYamlFrontmatter(raw));
    body = rest;
  }

  body = transformTagPlugins(body);
  return { frontmatterHtml, body };
}

// ── Post-processing (after sanitize + shiki) ─

const YOUTUBE_RE = /<div class="blog-youtube" data-id="([^"]+)"><\/div>/g;
const IFRAME_RE = /<div class="blog-iframe" data-src="([^"]+)"(?:\s+data-width="(\d+)")?(?:\s+data-height="(\d+)")?><\/div>/g;

export function postprocessHexo(html: string): string {
  html = html.replace(YOUTUBE_RE, (_, id: string) => {
    const url = `https://www.youtube.com/watch?v=${id}`;
    return `<div class="blog-youtube-card"><a href="${url}" target="_blank" rel="noopener noreferrer"><span class="blog-youtube-icon">▶</span> YouTube: ${escapeHtml(id)}</a></div>`;
  });

  html = html.replace(IFRAME_RE, (_, src: string, width?: string, height?: string) => {
    const dims = width && height ? ` (${width}×${height})` : '';
    return `<div class="blog-iframe-card"><a href="${src}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(src)}${dims}</a></div>`;
  });

  return html;
}
