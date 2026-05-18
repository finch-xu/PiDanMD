<p align="right"><a href="README.md">中文</a></p>

<p align="center">
  <img src="assets/logo.png" width="80" />
</p>

<h1 align="center">PiDanMD · 皮蛋记</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/release/finch-xu/PiDanMD?color=blue&label=version" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/Tauri-2-24C8D8?logo=tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/font-LXGW_WenKai-c9a961" />
</p>

<p align="center">A quiet writing tool for Markdown · cross-platform · local-first · one font family throughout</p>

<p align="center">
  <img src="assets/screenshot.png" width="720" />
</p>

---

## What is it

**PiDanMD (皮蛋记)** is a Markdown writing tool that chases quietness.

Open the app and the world settles. No sidebar, no toolbar, no tabs. Just a canvas, a cursor, and one font. When you need anything, every function is one `⌘K` away.

### Why another Markdown editor?

| PiDanMD | Others |
|---|---|
| **One font family throughout** (LXGW WenKai) — UI, body, code | iA Writer uses IBM Plex; Bear uses system fonts; most mix and look fragmented |
| **Typewriter mode + paragraph focus** — true writing immersion | Most don't have it |
| **Cross-platform** — macOS / Windows / Linux | iA Writer has no Linux; Bear is Apple-only |
| **Local-first** — pure file system, no accounts, no cloud | Notion / Obsidian Sync require lock-in |
| **Minimal but discoverable** — `⌘K` palette finds anything | iA Writer is minimal but functions get lost |

## Core features

### The writing immersion trio

| Mode | Shortcut | What it does |
|------|----------|--------------|
| Typewriter | `⌘⇧T` | Current line always stays vertically centered |
| Paragraph focus | `⌘⇧F` | Non-active paragraphs fade to 28% opacity |
| Immersive fullscreen | `F11` | Hides titlebar + statusbar — just the canvas |

Combine all three for long-form writing.

### Palette + quick open

| Shortcut | Use |
|----------|-----|
| `⌘K` | Command palette — search and run any action |
| `⌘O` | Quick open — fuzzy-search all Markdown files in workspace |
| `⌘B` | Toggle file sidebar |
| `⌘S` | Save |
| `⌘,` | Open settings |

### Editor modes

- **WYSIWYG (Tiptap)**: rich text editing with LaTeX, Mermaid, sub/sup, tables, task lists, code highlighting
- **Source (CodeMirror 6)**: raw Markdown with syntax highlighting
- **Preview**: read-only rendered view

All three switch with one click. Formulas / diagrams / frontmatter round-trip between modes without data loss (unit-tested in v1.0).

### Visual

- **3 themes**: 宣纸 Rice-paper / 古书 Classic-book / 暖灰夜 Warm-night (with proper surface layering)
- **Unified accent**: pidan-egg yellow `oklch(0.72 0.12 80)`
- **All interactions transition**: hover lifts shadow, press shrinks to `scale(0.97)`, 150ms ease

### Auto-update

GitHub Release + `tauri-plugin-updater`. Silent check on launch; popup card on bottom-right if a new version exists; one-click download + restart. Manually trigger anytime via `⌘K` → "Check for updates".

## Platform support

| OS | Arch | Min Version | Format |
|---------|------|---------|---------|
| macOS | ARM64 (Apple Silicon) | macOS 14.6 (Sonoma) | `.dmg` |
| Windows | x64 | Windows 10 (1803+) | `.msi` `.exe` |
| Windows | ARM64 | Windows 11 | `.msi` `.exe` |
| Linux | x64 | Ubuntu 22.04 / glibc 2.35+ | `.deb` / `.AppImage` |

## Tech stack

| Layer | Tech |
|------|------|
| Desktop framework | Tauri 2 |
| Frontend | React 19 + TypeScript 5 |
| Editor core | Tiptap 3 (ProseMirror) + CodeMirror 6 |
| UI components | shadcn/ui (New York) |
| State | Zustand |
| Styles | Tailwind CSS 4 |
| Tests | Vitest 4 + happy-dom |
| Font | LXGW WenKai Screen + LXGW WenKai Mono Screen |

## Development

```bash
# Install
pnpm install

# Dev mode (hot reload + Rust auto-rebuild)
pnpm tauri dev

# Frontend only
pnpm dev

# Run tests (markdown serialization round-trip)
pnpm test

# Build installer for current platform
pnpm tauri build
```

## Fonts

| Font | Use | License |
|------|------|--------|
| LXGW WenKai Screen | UI / body / heading | SIL OFL 1.1 |
| LXGW WenKai Mono Screen | code | SIL OFL 1.1 |

Source: https://github.com/lxgw/LxgwWenKai/releases

## Credits

- [MiaoYan](https://github.com/tw93/MiaoYan): UI design inspiration
- [iA Writer](https://ia.net/writer): the gold standard of minimalist writing
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai): the font that gave this app a soul

## License

[MIT](LICENSE)
