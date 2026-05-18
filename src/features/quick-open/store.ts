import { create } from "zustand";
import type { PaletteMode } from "./types";

// ── 浮层（快速打开 + 命令面板）状态 ──
//
// 两种 mode 共享同一个 Dialog UI（统一视觉），只是数据源和回车行为不同。

interface PaletteState {
  open: boolean;
  mode: PaletteMode;
  show: (mode: PaletteMode) => void;
  hide: () => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  open: false,
  mode: "command",
  show: (mode) => set({ open: true, mode }),
  hide: () => set({ open: false }),
}));
