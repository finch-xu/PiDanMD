// Hugo blog mode preprocessor
// Transforms Hugo shortcodes into standard Markdown or HTML placeholders.
// Supports YAML (---) and TOML (+++) front matter formats.

import {
  escapeHtml,
  extractYamlFrontmatter,
  extractTomlFrontmatter,
  parseYamlFrontmatter,
  parseTomlFrontmatter,
  renderFrontmatterCard,
} from './blog-frontmatter';

// ── Front Matter Detection ───────────────────

function extractHugoFrontmatter(markdown: string): { frontmatterHtml: string; body: string } {
  // Try TOML first (+++)
  const toml = extractTomlFrontmatter(markdown);
  if (toml.raw) {
    return {
      frontmatterHtml: renderFrontmatterCard(parseTomlFrontmatter(toml.raw)),
      body: toml.body,
    };
  }

  // Fall back to YAML (---)
  const yaml = extractYamlFrontmatter(markdown);
  if (yaml.raw) {
    return {
      frontmatterHtml: renderFrontmatterCard(parseYamlFrontmatter(yaml.raw)),
      body: yaml.body,
    };
  }

  return { frontmatterHtml: '', body: markdown };
}

// ── Shortcode Transforms ─────────────────────
// Hugo shortcodes: {{< name args >}} or {{% name args %}}
// Both syntaxes are supported and treated identically in preprocessing.

// {{< youtube ID >}} or {{% youtube ID %}}
function transformYoutube(body: string): string {
  return body.replace(
    /\{\{[<%]\s*youtube\s+["']?(\S+?)["']?\s*[>%]\}\}/g,
    (_, videoId: string) => {
      return `<div class="blog-youtube" data-id="${escapeHtml(videoId)}"></div>`;
    },
  );
}

// {{< figure src="..." [alt="..."] [caption="..."] [title="..."] >}}
function transformFigure(body: string): string {
  return body.replace(
    /\{\{[<%]\s*figure\s+(.*?)\s*[>%]\}\}/g,
    (_, args: string) => {
      const attrs: Record<string, string> = {};
      const attrRe = /(\w+)="([^"]*)"/g;
      let m;
      while ((m = attrRe.exec(args)) !== null) {
        attrs[m[1]] = m[2];
      }

      const src = attrs.src ?? '';
      const alt = attrs.alt ?? attrs.title ?? '';
      const caption = attrs.caption ?? '';

      if (caption) {
        return `<div class="blog-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" /><div class="blog-figcaption">${escapeHtml(caption)}</div></div>`;
      }
      return `![${alt}](${src}${attrs.title ? ` "${attrs.title}"` : ''})`;
    },
  );
}

// {{< highlight lang >}}...{{< /highlight >}}
function transformHighlight(body: string): string {
  return body.replace(
    /\{\{[<%]\s*highlight\s+(\w+)(?:\s+[^>%]*)?\s*[>%]\}\}([\s\S]*?)\{\{[<%]\s*\/highlight\s*[>%]\}\}/g,
    (_, lang: string, content: string) => {
      return '```' + lang + '\n' + content.trim() + '\n```';
    },
  );
}

// {{< gist user id [file] >}}
function transformGist(body: string): string {
  return body.replace(
    /\{\{[<%]\s*gist\s+(\S+)\s+(\S+)(?:\s+(\S+))?\s*[>%]\}\}/g,
    (_, user: string, id: string, file?: string) => {
      const fileAttr = file ? ` data-file="${escapeHtml(file)}"` : '';
      return `<div class="blog-gist" data-user="${escapeHtml(user)}" data-id="${escapeHtml(id)}"${fileAttr}></div>`;
    },
  );
}

// {{< ref "page.md" >}} or {{< relref "page.md" >}}
function transformRef(body: string): string {
  return body.replace(
    /\{\{[<%]\s*(?:rel)?ref\s+"([^"]+)"\s*[>%]\}\}/g,
    (_, page: string) => {
      return page;
    },
  );
}

// ── Main Pipeline ────────────────────────────

function transformHugoShortcodes(body: string): string {
  let result = body;
  result = transformHighlight(result);
  result = transformYoutube(result);
  result = transformFigure(result);
  result = transformGist(result);
  result = transformRef(result);
  return result;
}

export function preprocessHugo(markdown: string): { frontmatterHtml: string; body: string } {
  const { frontmatterHtml, body: rest } = extractHugoFrontmatter(markdown);
  const body = transformHugoShortcodes(rest);
  return { frontmatterHtml, body };
}

// ── Post-processing (after sanitize + shiki) ─

const YOUTUBE_RE = /<div class="blog-youtube" data-id="([^"]+)"><\/div>/g;
const GIST_RE = /<div class="blog-gist" data-user="([^"]+)" data-id="([^"]+)"(?:\s+data-file="([^"]+)")?><\/div>/g;

export function postprocessHugo(html: string): string {
  html = html.replace(YOUTUBE_RE, (_, id: string) => {
    const url = `https://www.youtube.com/watch?v=${id}`;
    return `<div class="blog-youtube-card"><a href="${url}" target="_blank" rel="noopener noreferrer"><span class="blog-youtube-icon">▶</span> YouTube: ${escapeHtml(id)}</a></div>`;
  });

  html = html.replace(GIST_RE, (_, user: string, id: string, file?: string) => {
    const url = `https://gist.github.com/${user}/${id}`;
    const label = file ? `${user}/${id} — ${file}` : `${user}/${id}`;
    return `<div class="blog-gist-card"><a href="${url}" target="_blank" rel="noopener noreferrer">📋 Gist: ${escapeHtml(label)}</a></div>`;
  });

  return html;
}
