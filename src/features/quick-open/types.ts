// ── 快速打开 + 命令面板共享类型 ──

/** 一条可被搜索和执行的"条目" - 命令或文件 */
export interface PaletteItem {
  /** 唯一 id（命令 id 或文件路径）*/
  id: string;
  /** 主标题（显示在列表行首）*/
  title: string;
  /** 副标题（显示在右侧，灰色）- 文件用相对路径，命令用快捷键 */
  hint?: string;
  /** 可选的搜索关键字（中英文混搜需要）*/
  keywords?: string;
  /** 选中时执行的动作 */
  run: () => void | Promise<void>;
}

export type PaletteMode = "command" | "file";
