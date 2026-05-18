import * as React from "react";
import { cn } from "~/lib/utils";
import { Tooltip } from "./tooltip";

// 紧凑型图标按钮，统一 TitleBar / BubbleMenu / 浮层关闭等场景。
// 与 Button 的 size="icon-sm" 区别：按下 scale 更深（0.92 vs 0.97），
// 因为小按钮需要更明显的物理反馈；可选 active 表示"已开启状态"。

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  /** 显示 Tooltip 的位置；不传则不显示 tooltip */
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, active, tooltipSide, className, children, ...rest }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md",
          "transition-[background-color,color,transform] duration-150 ease-out",
          "hover:bg-accent active:scale-[0.92]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
    if (!tooltipSide) return button;
    return (
      <Tooltip content={label} side={tooltipSide}>
        {button}
      </Tooltip>
    );
  }
);
IconButton.displayName = "IconButton";

/** 分隔条，TitleBar/BubbleMenu 共用 */
export function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-border/50" />;
}
