// Markdown 格式化：用 Prettier 标准 markdown parser。
// 单独的模块让"格式化"动作能被 TitleBar / 命令面板等任意入口复用。

export async function formatMarkdown(source: string): Promise<string> {
  const prettier = await import("prettier/standalone");
  const markdownPlugin = await import("prettier/plugins/markdown");
  return prettier.format(source, {
    parser: "markdown",
    plugins: [markdownPlugin.default ?? markdownPlugin],
  });
}
