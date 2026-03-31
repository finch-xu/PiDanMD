<p align="right"><a href="README.md">中文</a></p>

<p align="center">
  <img src="public/logo.png" width="80" />
</p>

<h1 align="center">PiDanMD</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/release/finch-xu/PiDanMD?color=blue&label=version" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/Tauri-2-24C8D8?logo=tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Tiptap-3-1a1a2e?logo=tiptap&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-1.80+-DEA584?logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

<p align="center">A lightweight and elegant cross-platform Markdown editor for macOS, Windows, and Linux. Features live preview, GFM, math equations, syntax highlighting, and ships with the beautiful LXGW WenKai font out of the box.</p>

<p align="center">
  <img src="public/screenshot.png" width="720" />
</p>

## Features

- **Live Preview** — One-click preview toggle, no split panes.
- **Multiple Rendering Modes** — Built-in Standard Markdown, Skills, Hexo, Jekyll, and Hugo rendering, ready for blog writing out of the box
- **GFM + Math + Syntax Highlighting** — GitHub Flavored Markdown, KaTeX equations, Shiki syntax highlighting, and Mermaid diagrams
- **Native Cross-Platform** — Built on Tauri 2 with small bundle size and fast startup, covering macOS / Windows / Linux  / x86_64 / ARM
- **Multilingual UI** — Simplified Chinese, Traditional Chinese, English, Japanese, Korean with automatic system language detection
- **Crafted Typography** — Bundled LXGW WenKai + Cascadia Code NF for beautiful CJK and Latin mixed typesetting
- **File Tree + Outline** — Sidebar file management and heading navigation for easy project organization.

## Platform Support

| OS | Architecture | Minimum Version | Format |
|----|-------------|----------------|--------|
| macOS | ARM64 (Apple Silicon) | macOS 14.6 (Sonoma) | `.dmg` |
| macOS | x64 (Intel) | macOS 14.6 (Sonoma) | `.dmg` |
| Windows | x64 | Windows 10 (1803+) | `.msi` `.exe` |
| Windows | ARM64 | Windows 11 | `.msi` `.exe` |
| Linux | x64 | Ubuntu 22.04 / Fedora 40+ / glibc 2.35+ | `.deb` `.rpm` `.AppImage` |
| Linux | ARM64 | Ubuntu 22.04 / Fedora 40+ / glibc 2.35+ | `.deb` `.rpm` `.AppImage` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri 2 |
| Frontend Framework | React 19 |
| Editor Engine | Tiptap 3 (ProseMirror) |
| UI Components | shadcn/ui (New York) |
| State Management | Zustand |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Build Tool | Vite |
| Languages | TypeScript 5 + Rust |

## Prerequisites

- [Rust](https://rustup.rs/) (stable 1.80+)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- Platform-specific Tauri 2 dependencies, see [Tauri docs](https://v2.tauri.app/start/prerequisites/)

## Development

```bash
# 1. Install frontend dependencies
pnpm install

# 2. Start dev mode (frontend HMR + Rust auto-recompile)
pnpm tauri dev
```

In dev mode, the Vite dev server runs at `http://localhost:5173` and the Tauri window loads from it automatically. Frontend changes hot-reload instantly; Rust changes trigger an automatic recompile and app restart.

To debug frontend only (without the Tauri desktop window):

```bash
pnpm dev
```

Then open `http://localhost:5173` in a browser (note: Tauri API calls won't work — this is only for debugging UI layout and styles).

## Build

```bash
# Build installer for the current platform
pnpm tauri build
```

Build artifacts are located at `src-tauri/target/release/bundle/`:

| Platform | Output |
|----------|--------|
| macOS | `.dmg`, `.app` |
| Windows | `.msi`, `.exe` (NSIS) |
| Linux | `.deb`, `.rpm`, `.AppImage` |

To build frontend only (without desktop packaging):

```bash
pnpm build
```

Output goes to the `dist/` directory.

## Project Structure

```
PiDanMD/
├── src/                    # Frontend source (React + TypeScript)
│   ├── components/ui/      # Shared UI components (shadcn/ui)
│   ├── features/           # Feature modules
│   │   ├── editor/         # Tiptap editor
│   │   ├── settings/       # Settings dialog
│   │   ├── sidebar/        # File sidebar
│   │   └── titlebar/       # Custom title bar
│   ├── stores/             # Zustand state management
│   ├── lib/                # Utilities (Tauri commands, i18n, config)
│   ├── hooks/              # React hooks
│   ├── styles/             # Editor styles
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend (Tauri 2)
│   ├── src/
│   │   ├── commands/       # Tauri commands (file ops, config, fonts)
│   │   ├── menu.rs         # App menu
│   │   └── state.rs        # App state
│   └── tauri.conf.json     # Tauri config
├── public/                 # Static assets (logo, fonts)
└── package.json
```

## Bundled Fonts

This project bundles the following fonts. See [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES.md) for details.

| Font | Usage | License |
|------|-------|---------|
| LXGW WenKai Screen | Body / UI | SIL OFL 1.1 |
| Cascadia Code NF | Code | SIL OFL 1.1 |
| Noto Color Emoji | Emoji | SIL OFL 1.1 + Apache 2.0 |
| Noto Sans Symbols | Symbols | SIL OFL 1.1 |

## License Audit

This project uses [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) to check Rust dependency license compatibility.

```bash
cargo install cargo-deny        # first-time setup
cd src-tauri && cargo deny check licenses
```

## Acknowledgments

The UI design of this project is inspired by [MiaoYan](https://github.com/tw93/MiaoYan). If you are looking for a native macOS Markdown editor, MiaoYan is highly recommended.

## License

[MIT](LICENSE)
