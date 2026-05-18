import { useEffect } from "react";
import { useAutoUpdate } from "./useAutoUpdate";
import { useUpdaterStore } from "./store";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Download, CheckCircle2, RefreshCw } from "lucide-react";

// 启动时静默检查后的悬浮更新提示
export function UpdateBanner() {
  const { status, checkForUpdates, downloadAndInstall, restart } = useAutoUpdate({
    silentOnMount: true,
  });

  // 监听 store 的请求计数：每次外部调 requestCheck() 计数 +1 即触发主动检查
  const checkRequestId = useUpdaterStore((s) => s.checkRequestId);
  useEffect(() => {
    if (checkRequestId > 0) {
      checkForUpdates(false);
    }
  }, [checkRequestId, checkForUpdates]);

  if (status.kind === "idle") return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 rounded-2xl border border-border/60 bg-popover p-4",
        "pidan-shadow-floating pidan-anim-slide"
      )}
    >
      {status.kind === "checking" && (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm">正在检查更新...</span>
        </div>
      )}

      {status.kind === "uptodate" && (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 pidan-text-brand" />
          <span className="text-sm">已是最新版本</span>
        </div>
      )}

      {status.kind === "available" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 pidan-text-brand" />
            <span className="text-sm font-medium">
              新版本 v{status.version} 可用
            </span>
          </div>
          {status.notes && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {status.notes}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={downloadAndInstall} className="flex-1">
              下载并安装
            </Button>
          </div>
        </div>
      )}

      {status.kind === "downloading" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin pidan-text-brand" />
            <span className="text-sm font-medium">
              正在下载 v{status.version}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full pidan-bg-brand transition-all duration-200"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{status.progress}%</p>
        </div>
      )}

      {status.kind === "ready" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 pidan-text-brand" />
            <span className="text-sm font-medium">v{status.version} 已就绪</span>
          </div>
          <p className="text-xs text-muted-foreground">
            重启后即可使用新版本。
          </p>
          <Button size="sm" onClick={restart} className="w-full">
            立即重启
          </Button>
        </div>
      )}

      {status.kind === "error" && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-destructive">更新失败</span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}
