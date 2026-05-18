import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMac =
  typeof navigator !== "undefined" && navigator.userAgent.includes("Mac");

/** 修饰键显示符号（macOS = ⌘，其它 = Ctrl）*/
export const modKey = isMac ? "⌘" : "Ctrl";

/** 跨平台 basename：处理 / 和 \\ 两种分隔符 */
export function basename(path: string): string {
  return path.split(/[/\\]/).filter(Boolean).pop() ?? path;
}

/** 把绝对路径压缩成 ".../<dir>/<file>" 形式，便于狭窄空间展示 */
export function shortenPath(path: string): string {
  const parts = path.split(/[/\\]/).filter(Boolean);
  if (parts.length <= 2) return path;
  return ".../" + parts.slice(-2).join("/");
}
