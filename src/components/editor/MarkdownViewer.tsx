import { createSignal, createEffect } from 'solid-js';
import { content, filePath, loadFile } from '~/stores/editor';
import { resolvedTheme } from '~/stores/settings';
import { renderMarkdown } from '~/lib/editor/render-markdown';
import { extractHeadings } from '~/lib/editor/toc-extractor';
import { setHeadings } from '~/stores/toc';
import { debounce } from '~/lib/utils/debounce';
import { openUrl } from '@tauri-apps/plugin-opener';

function resolvePath(base: string, relative: string): string {
  const parts = (base + relative).split('/');
  const resolved: string[] = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.' && p !== '') resolved.push(p);
  }
  return '/' + resolved.join('/');
}

function handleLinkClick(e: MouseEvent) {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor) return;

  e.preventDefault();
  const href = anchor.getAttribute('href');
  if (!href) return;

  // Block dangerous URI schemes
  if (/^(javascript|data|vbscript|file):/i.test(href)) return;

  if (/^https?:\/\//.test(href)) {
    openUrl(href);
    return;
  }

  if (href.endsWith('.md') || href.endsWith('.markdown')) {
    const currentDir = filePath()?.replace(/[^/]+$/, '') ?? '';
    const resolved = resolvePath(currentDir, href);
    loadFile(resolved);
    return;
  }

  if (href.startsWith('#')) {
    const id = decodeURIComponent(href.slice(1));
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  openUrl(href);
}

export function MarkdownViewer() {
  const [html, setHtml] = createSignal('');
  let renderVersion = 0;

  const updateToc = debounce((md: string) => {
    setHeadings(extractHeadings(md));
  }, 300);

  const fileName = () => filePath()?.split('/').pop() ?? '';

  createEffect(() => {
    const md = content();
    const theme = resolvedTheme(); // Track theme changes
    if (!md) return;

    const version = ++renderVersion;
    renderMarkdown(md, theme, fileName()).then((result) => {
      if (version === renderVersion) {
        setHtml(result);
      }
    });
    updateToc(md);
  });

  return (
    <div class="markdown-body" innerHTML={html()} onClick={handleLinkClick} />
  );
}
