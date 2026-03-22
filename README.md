<p align="right"><a href="README_EN.md">English</a></p>

<p align="center">
  <img src="public/logo.png" width="80" />
</p>

<h1 align="center">PiDanMD 皮蛋记</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/release/finch-xu/PiDanMD?color=blue&label=version" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/Tauri-2-24C8D8?logo=tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/SolidJS-1.9-2C4F7C?logo=solid&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-1.80+-DEA584?logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

<p align="center">一个轻量美观的跨平台 Markdown 编辑器桌面应用，支持 macOS / Windows / Linux，提供实时预览、GFM、数学公式与代码高亮，开箱即用，并使用了霞鹜文楷字体美观简洁。</p>

<p align="center">
  <img src="public/screenshot.png" width="720" />
</p>

## 已实现功能

- **实时预览** — 一键切换预览，拒绝左右分栏。
- **多渲染模式** — 内置标准 Markdown、skills、Hexo、Jekyll、Hugo 渲染，博客写作开箱即用
- **GFM + 数学公式 + 代码高亮** — 支持 GitHub Flavored Markdown、KaTeX 公式、Shiki 语法高亮与 Mermaid 图表
- **原生跨平台** — 基于 Tauri 2，安装包体积小、启动快，覆盖 macOS / Windows / Linux / x86_64 / ARM
- **多语言支持** — 简体中文、繁體中文、English、日本語、한국어，自动跟随系统语言
- **精心排版** — 内置霞鹜文楷 + Cascadia Code NF，中英文混排美观舒适
- **文件树 + 大纲** — 侧栏文件管理与目录导航，轻松组织项目文档。

## 平台支持

| 操作系统 | 架构 | 最低版本 | 安装格式 |
|---------|------|---------|---------|
| macOS | ARM64 (Apple Silicon) | macOS 14.6 (Sonoma) | `.dmg` |
| macOS | x64 (Intel) | macOS 14.6 (Sonoma) | `.dmg` |
| Windows | x64 | Windows 10 (1803+) | `.msi` `.exe` |
| Windows | ARM64 | Windows 11 | `.msi` `.exe` |
| Linux | x64 | Ubuntu 22.04 / Fedora 40+ / glibc 2.35+ | `.deb` `.rpm` `.AppImage` |
| Linux | ARM64 | Ubuntu 22.04 / Fedora 40+ / glibc 2.35+ | `.deb` `.rpm` `.AppImage` |

## 技术选型

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端框架 | SolidJS |
| 编辑器内核 | CodeMirror 6 |
| Markdown 渲染 | unified (remark + rehype) |
| 代码高亮 | Shiki |
| 数学公式 | KaTeX |
| 样式 | Tailwind CSS 4 |
| icons | lucide |

## 开发

需要预装 [Rust](https://rustup.rs/) 和 [pnpm](https://pnpm.io/)。

```bash
pnpm install
pnpm tauri dev
```

## 打包

```bash
pnpm tauri build
```

## 内置字体

本项目内置以下字体，详见 [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES.md)。

| 字体 | 用途 | 许可证 |
|------|------|--------|
| LXGW WenKai Screen (霞鹜文楷屏幕阅读版) | 正文 / UI | SIL OFL 1.1 |
| Cascadia Code NF | 代码 | SIL OFL 1.1 |
| Noto Color Emoji | Emoji | SIL OFL 1.1 + Apache 2.0 |
| Noto Sans Symbols | 符号 | SIL OFL 1.1 |

## 许可证检查

本项目使用 [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) 检查 Rust 依赖的许可证兼容性。

```bash
cargo install cargo-deny        # 首次使用需安装
cd src-tauri && cargo deny check licenses
```

## 致谢

本项目的界面设计受到 [妙言 MiaoYan](https://github.com/tw93/MiaoYan) 的启发。如果你正在寻找一款原生 macOS Markdown 编辑器，强烈推荐妙言。

## License

[MIT](LICENSE)
