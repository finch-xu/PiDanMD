import * as React from "react";
import { cn } from "~/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  /** 显示前延迟（ms）。避免用户路过控件就弹气泡 */
  delay?: number;
}

function Tooltip({ content, children, side = "bottom", delay = 400 }: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  const cancel = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onEnter = () => {
    cancel();
    timer.current = window.setTimeout(() => setShow(true), delay);
  };

  const onLeave = () => {
    cancel();
    setShow(false);
  };

  React.useEffect(() => cancel, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md",
            // 用 popover 色 + 反色文字，dark 主题也清晰
            "bg-popover text-popover-foreground border border-border/60",
            "px-2.5 py-1 text-xs font-medium",
            "pidan-shadow-floating pidan-anim-fade pointer-events-none",
            positionClasses[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
