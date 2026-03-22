import { createSignal, createEffect } from 'solid-js';
import { content, filePath, loadFile, renderingMode } from '~/stores/editor';
import { resolvedTheme } from '~/stores/settings';
import { renderMarkdown } from '~/lib/editor/render-markdown';
import { extractHeadings } from '~/lib/editor/toc-extractor';
import { setHeadings } from '~/stores/toc';
import { debounce } from '~/lib/utils/debounce';
import { resolvePath, dirname } from '~/lib/utils/path';
import { openUrl } from '@tauri-apps/plugin-opener';

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
    const currentDir = filePath() ? dirname(filePath()!) : '';
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

  createEffect(() => {
    const md = content();
    const theme = resolvedTheme(); // Track theme changes
    const mode = renderingMode(); // Track rendering mode changes
    if (!md) return;

    const version = ++renderVersion;
    renderMarkdown(md, theme, filePath() ?? undefined, mode).then((result) => {
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
