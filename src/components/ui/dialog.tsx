import * as React from "react";
import { cn } from "~/lib/utils";
import { X } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩：更轻的黑（让品牌色不被压死）+ 更强模糊 + 淡入 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md pidan-anim-fade"
        onClick={() => onOpenChange(false)}
      />
      {/* 内容卡片：圆角更大、阴影更深、淡入伴轻微缩放 */}
      <div
        className={cn(
          "relative z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto",
          "rounded-2xl border border-border/60 bg-popover text-popover-foreground p-6",
          "pidan-shadow-overlay pidan-anim-zoom",
          className
        )}
        {...props}
      >
        {/* 关闭按钮：圆角圈住的 hover 态 + 缩放反馈 */}
        <button
          className={cn(
            "absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-md",
            "text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out",
            "hover:bg-accent hover:text-foreground active:scale-[0.92]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          )}
          onClick={() => onOpenChange(false)}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle };
