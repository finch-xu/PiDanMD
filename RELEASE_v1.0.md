# PiDanMD v1.0 · 极简中文写作工具

## 这是什么版本

v1.0 是一次彻底重新定位：从"又一个 Markdown 编辑器"变成"一个让你想静下来写字的工具"。

打开 app，世界静下来——没有侧栏、没有工具栏、没有标签页。你只剩下一个画布、一支笔、一种字体。

## ✨ 新功能

### 写作沉浸三件套
- **打字机模式 `⌘⇧T`**：当前编辑行始终保持在视窗垂直中央
- **段落聚焦 `⌘⇧F`**：非当前段落淡化为 28% 透明度
- **沉浸全屏 `F11`**：隐藏标题栏 + 状态栏，整屏只剩画布

三种模式可任意组合，专注感拉满。

### 命令面板 + 快速打开
- `⌘K` 命令面板：搜索并执行任何操作
- `⌘O` 快速打开：模糊搜索 workspace 所有 Markdown 文件
- `⌘B` 切换文件树

### 霞鹜文楷家族贯穿全 app
- **UI / 正文 / 标题**：霞鹜文楷屏幕阅读版
- **代码 / 等宽**：霞鹜文楷等宽屏幕阅读版（v1.0 新增，替换 Cascadia Code）
- 同一字体家族，告别中英文混排割裂

### 全新设计语言
- **3 个主题**：宣纸（米黄）/ 古书（暖色经典）/ 暖灰夜（带 surface 分层的精致暗色）
- **统一强调色**：松花蛋黄 `oklch(0.72 0.12 80)`，呼应"皮蛋"产品名
- **微动效**：所有交互都有 150ms 过渡；按钮按下 `scale(0.97)`；浮层淡入伴轻微缩放

### 基于 GitHub Release 的自动更新
- 启动时静默检查一次
- 有更新自动右下角弹卡片，一键下载 + 重启
- 任何时候可 `⌘K` → "检查更新" 主动触发

## 🐛 修复的关键 Bug

- **#27** LaTeX 公式在所见即所得模式切换时丢失（根因：`findMathInlineStart` 跳过 `$$` 时只跳过一个 `$`）
- **#23/#26** Mermaid 图表不渲染（重写 mermaid-block：移除 module-level 全局状态 + 主题切换重渲染 + 兼容不同 markdown parser 的 lang 字段）
- **#25** S3/HTTPS 远程图片加载失败（CSP `img-src` 加 `https:` / `http:` / `blob:`）
- **#24** Windows 标题栏布局浪费（重做：统一 macOS / Windows 布局，文件名左对齐，操作按钮紧靠右侧）
- **#20** 自动更新功能集成

## 🏗️ 架构升级

- 新建 `src/lib/markdown-serde/` 统一 Markdown 序列化层，加 24 个 vitest 单测覆盖 LaTeX inline/block、Mermaid、frontmatter、sub/sup
- 新建 `src/features/writing-modes/` 写作模式
- 新建 `src/features/quick-open/` 命令面板 + 快速打开
- 新建 `src/features/updater/` 自动更新 hook 和 UI
- 新建 `src/lib/design-tokens.ts` 设计令牌

## ⚠️ 破坏性变化

- 默认布局从 `files`（有侧栏）改为 `focus`（无侧栏）。老用户用 `⌘B` 切回
- 主题精简到 3 个，删除 `claude` / `night`。老用户配置自动迁移：`claude → default-light`、`night → default-dark`
- 代码字体默认从 Cascadia Code NF 改为霞鹜文楷 Mono Screen。老用户配置自动迁移
- 多渲染模式（Hexo/Jekyll/Hugo）的 UI 入口已移除（代码保留，未来作为模板形式回归）

## 📦 下载

下方资产按平台分发：
- macOS Apple Silicon: `.dmg`
- Windows x64 / ARM64: `.msi` 或 `.exe`
- Linux x64: `.deb` / `.AppImage`

## 🙏 致谢

- [妙言 MiaoYan](https://github.com/tw93/MiaoYan)：界面设计的启发
- [iA Writer](https://ia.net/writer)：极简禅意写作的标杆
- [霞鹜文楷](https://github.com/lxgw/LxgwWenKai)：让这个 app 有了灵魂
