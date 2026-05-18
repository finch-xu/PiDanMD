import { useEffect, useState, useCallback, useRef } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

// 状态机：idle → checking → (uptodate | available → downloading → ready) | error
// 基于 GitHub Release + tauri-plugin-updater 2.x。

export type UpdateStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "uptodate" }
  | { kind: "available"; version: string; notes?: string; update: Update }
  | { kind: "downloading"; version: string; progress: number; update: Update }
  | { kind: "ready"; version: string; update: Update }
  | { kind: "error"; message: string };

export function useAutoUpdate(options: { silentOnMount?: boolean } = {}) {
  const [status, setStatus] = useState<UpdateStatus>({ kind: "idle" });
  // 跟踪所有挂载期 timeout，组件卸载时清理避免 unmounted setState 警告
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // idle 已是 idle 不重新 set，避免下游 subscriber 无谓 re-render
  const setIdle = useCallback(() => {
    setStatus((s) => (s.kind === "idle" ? s : { kind: "idle" }));
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    const set = timeoutsRef.current;
    return () => {
      set.forEach(clearTimeout);
      set.clear();
    };
  }, []);

  // 主动检查更新
  const checkForUpdates = useCallback(async (silent = false) => {
    setStatus({ kind: "checking" });
    try {
      const update = await check();
      if (!update) {
        if (silent) {
          setIdle();
        } else {
          setStatus({ kind: "uptodate" });
          scheduleTimeout(() => {
            setStatus((s) => (s.kind === "uptodate" ? { kind: "idle" } : s));
          }, 3000);
        }
        return;
      }
      setStatus({
        kind: "available",
        version: update.version,
        notes: update.body,
        update,
      });
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (silent) {
        console.warn("[updater] silent check failed:", msg);
        setIdle();
      } else {
        setStatus({ kind: "error", message: msg });
      }
    }
  }, [setIdle, scheduleTimeout]);

  // 下载并安装
  // 用 ref 读最新 status，避免依赖 status 导致每次 progress chunk 都重建回调
  const statusRef = useRef(status);
  statusRef.current = status;

  const downloadAndInstall = useCallback(async () => {
    const current = statusRef.current;
    if (current.kind !== "available") return;
    const update = current.update;
    setStatus({ kind: "downloading", version: update.version, progress: 0, update });
    try {
      let total = 0;
      let received = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            total = event.data.contentLength ?? 0;
            break;
          case "Progress":
            received += event.data.chunkLength;
            if (total > 0) {
              setStatus({
                kind: "downloading",
                version: update.version,
                progress: Math.min(99, Math.round((received / total) * 100)),
                update,
              });
            }
            break;
          case "Finished":
            setStatus({ kind: "ready", version: update.version, update });
            break;
        }
      });
    } catch (e: any) {
      setStatus({ kind: "error", message: e?.message ?? String(e) });
    }
  }, []);

  const restart = useCallback(async () => {
    try {
      await relaunch();
    } catch (e) {
      console.error("Restart failed:", e);
    }
  }, []);

  // 启动时静默检查一次（延迟 3 秒，避免和首屏渲染抢资源）
  useEffect(() => {
    if (!options.silentOnMount) return;
    const t = scheduleTimeout(() => checkForUpdates(true), 3000);
    return () => clearTimeout(t);
  }, [options.silentOnMount, checkForUpdates, scheduleTimeout]);

  return { status, checkForUpdates, downloadAndInstall, restart };
}
