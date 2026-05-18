import * as React from "react";
import { cn } from "~/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // 基础
        "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm",
        // 文件输入
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // 占位符
        "placeholder:text-muted-foreground/70",
        // 过渡（v1.0 统一基线 150ms）
        "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
        // hover 微微亮一点（暗示可交互）
        "hover:border-border/80",
        // focus：双层 ring + 背景微亮 + 边框抹平（让 ring 接管视觉边界）
        "focus-visible:outline-none focus-visible:border-transparent",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "focus-visible:bg-background",
        // 禁用
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
