// Shared front matter parsing and rendering for blog modes (Hexo, Jekyll, Hugo).
// All blog modes share the same YAML front matter parsing and card rendering.
// Hugo additionally supports TOML (+++).

// ── Types ────────────────────────────────────

export interface BlogFrontmatter {
  title?: string;
  date?: string;
  updated?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  [key: string]: string | string[] | undefined;
}

// ── Helpers ──────────────────────────────────

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── YAML Front Matter ────────────────────────

const YAML_FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function parseYamlArray(value: string): string[] {
  const inlineMatch = value.match(/^\[(.*)\]$/);
  if (inlineMatch) {
    return inlineMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function parseYamlFrontmatter(raw: string): BlogFrontmatter {
  const fm: BlogFrontmatter = {};
  let currentKey = '';
  let listItems: string[] | null = null;

  for (const line of raw.split('\n')) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (kvMatch) {
      if (listItems && currentKey) {
        fm[currentKey] = listItems;
        listItems = null;
      }
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (!value) {
        listItems = [];
      } else {
        const arr = parseYamlArray(value);
        fm[currentKey] = arr.length > 0 ? arr : value;
      }
    } else if (currentKey) {
      const dashMatch = line.match(/^\s*-\s+(.*)/);
      if (dashMatch) {
        if (!listItems) listItems = [];
        listItems.push(dashMatch[1].trim());
      } else if (line.trim() && !listItems) {
        fm[currentKey] = ((fm[currentKey] as string) || '') + ' ' + line.trim();
      }
    }
  }
  if (listItems && currentKey) {
    fm[currentKey] = listItems;
  }
  return fm;
}

export function extractYamlFrontmatter(markdown: string): { raw: string | null; body: string } {
  const match = markdown.match(YAML_FM_RE);
  if (!match) return { raw: null, body: markdown };
  return { raw: match[1], body: markdown.slice(match[0].length).replace(/^\r?\n/, '') };
}

// ── TOML Front Matter (Hugo) ─────────────────

const TOML_FM_RE = /^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/;

export function extractTomlFrontmatter(markdown: string): { raw: string | null; body: string } {
  const match = markdown.match(TOML_FM_RE);
  if (!match) return { raw: null, body: markdown };
  return { raw: match[1], body: markdown.slice(match[0].length).replace(/^\r?\n/, '') };
}

export function parseTomlFrontmatter(raw: string): BlogFrontmatter {
  const fm: BlogFrontmatter = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const kvMatch = trimmed.match(/^(\w[\w-]*)\s*=\s*(.*)/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    let value = kvMatch[2].trim();

    // Array: ["item1", "item2"]
    const arrMatch = value.match(/^\[(.*)\]$/);
    if (arrMatch) {
      fm[key] = arrMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }

    // String: "value" or 'value'
    const strMatch = value.match(/^["'](.*?)["']$/);
    if (strMatch) {
      fm[key] = strMatch[1];
      continue;
    }

    // Boolean or number or bare string
    fm[key] = value;
  }
  return fm;
}

// ── Card Rendering ───────────────────────────

export function renderFrontmatterCard(fm: BlogFrontmatter): string {
  const parts: string[] = ['<div class="blog-frontmatter">'];

  if (fm.title) {
    parts.push(`<div class="blog-fm-title">${escapeHtml(fm.title)}</div>`);
  }

  const metaParts: string[] = [];
  if (fm.date) metaParts.push(escapeHtml(fm.date));
  if (fm.updated) metaParts.push(`updated: ${escapeHtml(fm.updated)}`);
  if (fm.author) metaParts.push(escapeHtml(fm.author));
  if (metaParts.length > 0) {
    parts.push(`<div class="blog-fm-meta">${metaParts.join(' · ')}</div>`);
  }

  const tags = fm.tags;
  if (Array.isArray(tags) && tags.length > 0) {
    const pills = tags.map((tag) => `<span class="blog-tag-pill">${escapeHtml(tag)}</span>`).join('');
    parts.push(`<div class="blog-fm-tags">${pills}</div>`);
  }

  const categories = fm.categories;
  if (Array.isArray(categories) && categories.length > 0) {
    const pills = categories.map((cat) => `<span class="blog-category-pill">${escapeHtml(cat)}</span>`).join('');
    parts.push(`<div class="blog-fm-categories">${pills}</div>`);
  }

  const skip = new Set(['title', 'date', 'updated', 'author', 'tags', 'categories']);
  const extras = Object.entries(fm).filter(([k]) => !skip.has(k));
  if (extras.length > 0) {
    parts.push('<div class="blog-fm-fields">');
    for (const [key, value] of extras) {
      const display = Array.isArray(value) ? value.join(', ') : String(value ?? '');
      parts.push(`<div><span class="blog-fm-field-key">${escapeHtml(key)}:</span>${escapeHtml(display)}</div>`);
    }
    parts.push('</div>');
  }

  parts.push('</div>');
  return parts.join('\n');
}
