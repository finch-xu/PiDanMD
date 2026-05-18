import { create } from "zustand";

// 自动更新触发器 store。
// 用一个递增 id 作为 "请求事件"：commands.ts → requestCheck() → id++
// → UpdateBanner 内 useEffect 监听 id 变化 → 触发 check。
// 这样命令面板（纯函数）和 React hook 解耦，不再需要全局可变 ref。

interface UpdaterState {
  checkRequestId: number;
  requestCheck: () => void;
}

export const useUpdaterStore = create<UpdaterState>((set) => ({
  checkRequestId: 0,
  requestCheck: () => set((s) => ({ checkRequestId: s.checkRequestId + 1 })),
}));
