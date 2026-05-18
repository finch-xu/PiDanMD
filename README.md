<p align="right"><a href="README_EN.md">English</a></p>

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

<p align="center">一个安静的中文写作工具 · 跨平台 · 本地优先 · 霞鹜文楷家族字体贯穿全 app</p>

<p align="center">
  <img src="assets/screenshot.png" width="720" />
</p>

---

## 这是什么

**皮蛋记**是一款追求"安静"的 Markdown 写作工具。

打开 app，世界静下来——没有侧栏、没有工具栏、没有标签页。你只剩下一个画布、一支笔、一种字体。当你需要的时候，所有功能都在 `⌘K` 命令面板里等你。

### 与其他 Markdown 编辑器有什么不同？

| 它  | 别人 |
|---|---|
| **霞鹜文楷家族贯穿全 app**——UI / 正文 / 代码都是同一家族 | iA Writer 用 IBM Plex 系列；Bear 用系统字体；其他多数中英文割裂 |
| **打字机模式 + 段落聚焦**——专注感拉满 | Typora/MarkText 通常无 |
| **跨平台**——macOS / Windows / Linux 全支持 | iA Writer 无 Linux；Bear 仅苹果生态 |
| **本地优先**——纯文件系统，无账号、无云 | Notion / Obsidian Sync 都要求绑定 |
| **极简而非简陋**——`⌘K` 命令面板找回所有功能 | iA Writer 极简但找不到东西 |

## 核心功能

### 写作沉浸三件套

| 模式 | 快捷键 | 行为 |
|------|--------|------|
| 打字机模式 | `⌘⇧T` | 当前编辑行始终保持在视窗垂直中央 |
| 段落聚焦 | `⌘⇧F` | 非当前段落淡化为 28% 透明度，视觉收束 |
| 沉浸全屏 | `F11` | 隐藏标题栏 + 状态栏，整屏只剩画布 |

三种模式可以任意组合，写长文时建议三个都开。

### 命令面板与快速打开

| 快捷键 | 用途 |
|--------|------|
| `⌘K` | 命令面板：搜索并执行任何操作 |
| `⌘O` | 快速打开：模糊搜索 workspace 所有 Markdown 文件 |
| `⌘B` | 切换文件树侧栏 |
| `⌘S` | 保存 |
| `⌘,` | 打开设置 |

### 编辑模式

- **所见即所得（Tiptap）**：富文本编辑体验，支持 LaTeX、Mermaid、Sub/Sup、表格、任务列表、代码高亮
- **源码模式（CodeMirror 6）**：纯 Markdown 编辑，Markdown 语法高亮
- **预览模式**：纯渲染查看，不可编辑

三种模式可一键切换，公式 / 图表 / frontmatter 等内容在模式间往返不丢失（v1.0 已通过单元测试覆盖）。

### 视觉

- **3 个主题**：宣纸（米黄）/ 古书（暖色经典）/ 暖灰夜（带 surface 分层的精致暗色）
- **统一强调色**：松花蛋黄 `oklch(0.72 0.12 80)`
- **所有交互都有过渡**：hover 阴影浮起、按下 `scale(0.97)`、150ms 缓动

### 自动更新

基于 GitHub Release + `tauri-plugin-updater`。打开 app 时静默检查一次，有更新就在右下角弹出卡片，一键下载 + 重启。任意时候也可以 `⌘K` → "检查更新"主动触发。

## 平台支持

| 操作系统 | 架构 | 最低版本 | 安装格式 |
|---------|------|---------|---------|
| macOS | ARM64（Apple Silicon）| macOS 14.6 (Sonoma) | `.dmg` |
| Windows | x64 | Windows 10 (1803+) | `.msi` `.exe` |
| Windows | ARM64 | Windows 11 | `.msi` `.exe` |
| Linux | x64 | Ubuntu 22.04 / glibc 2.35+ | `.deb` / `.AppImage` |

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端 | React 19 + TypeScript 5 |
| 编辑器内核 | Tiptap 3 (ProseMirror) + CodeMirror 6 |
| UI 组件 | shadcn/ui (New York) |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS 4 |
| 测试 | Vitest 4 + happy-dom |
| 字体 | LXGW WenKai Screen + LXGW WenKai Mono Screen |

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发模式（前端热更新 + Rust 自动重编译）
pnpm tauri dev

# 仅前端调试
pnpm dev

# 跑测试（markdown 序列化往返）
pnpm test

# 构建本平台安装包
pnpm tauri build
```

## 项目结构

```
PiDanMD/
├── src/                        # 前端 (React + TypeScript)
│   ├── components/ui/          # 通用 UI 组件 (shadcn/ui)
│   ├── features/
│   │   ├── editor/             # Tiptap + CodeMirror 编辑器
│   │   ├── quick-open/         # ⌘O 快速打开 + ⌘K 命令面板
│   │   ├── writing-modes/      # 打字机 / 段落聚焦
│   │   ├── updater/            # 自动更新 hook + 横幅
│   │   ├── titlebar/           # 极简自定义标题栏
│   │   ├── sidebar/            # 文件树（默认隐藏，⌘B 呼出）
│   │   ├── outline/            # 文档大纲
│   │   └── settings/           # 设置弹窗
│   ├── stores/                 # Zustand 状态
│   ├── lib/
│   │   ├── markdown-serde/     # Markdown 序列化中央模块（带 vitest 单测）
│   │   ├── design-tokens.ts    # 设计令牌（motion/radii/shadows/press_scale）
│   │   ├── themes.ts           # 3 主题定义
│   │   ├── i18n.ts             # 多语言
│   │   └── ...
│   ├── styles/editor.css       # 编辑器内容样式 + 写作模式 CSS
│   └── App.tsx
├── src-tauri/                  # Rust 后端 (Tauri 2)
│   ├── src/
│   │   ├── commands/           # 文件操作、配置、字体
│   │   └── lib.rs              # 应用入口 + plugin 注册（含 updater）
│   ├── capabilities/           # 权限声明
│   └── tauri.conf.json         # CSP / updater endpoint / 窗口
├── scripts/
│   └── build-latest-json.sh    # 生成 updater manifest
└── .github/workflows/release.yml
```

## 发版（维护者）

详见 [RELEASE.md](RELEASE.md)。简要：

1. 第一次发布前用 `pnpm tauri signer generate` 生成 updater 密钥对
   - 公钥粘到 `src-tauri/tauri.conf.json` 的 `plugins.updater.pubkey`
   - 私钥 + 密码放进 GitHub repo secrets：`TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
2. 升版本号：`package.json` / `src-tauri/Cargo.toml` / `src-tauri/tauri.conf.json` 三处同步
3. 创建 GitHub Release（tag 形如 `v1.0.0`），workflow 自动构建所有平台 + 上传 + 生成 `latest.json`

## 内置字体

| 字体 | 用途 | 许可证 |
|------|------|--------|
| LXGW WenKai Screen（霞鹜文楷屏幕阅读版）| UI / 正文 / 标题 | SIL OFL 1.1 |
| LXGW WenKai Mono Screen（霞鹜文楷等宽屏幕阅读版）| 代码 | SIL OFL 1.1 |

字体来源：https://github.com/lxgw/LxgwWenKai/releases

## 致谢

- [妙言 MiaoYan](https://github.com/tw93/MiaoYan)：界面设计的启发
- [iA Writer](https://ia.net/writer)：极简禅意写作的标杆
- [霞鹜文楷](https://github.com/lxgw/LxgwWenKai)：让这个 app 有了灵魂

## License

[MIT](LICENSE)
