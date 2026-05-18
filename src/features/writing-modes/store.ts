import { create } from "zustand";

// 纯视觉的"沉浸开关"。fullscreen 走 app-store（要调 Tauri API），这里不管。

interface WritingModeState {
  typewriter: boolean;
  focusParagraph: boolean;
  toggleTypewriter: () => void;
  toggleFocusParagraph: () => void;
  setTypewriter: (value: boolean) => void;
  setFocusParagraph: (value: boolean) => void;
}

export const useWritingModeStore = create<WritingModeState>((set) => ({
  typewriter: false,
  focusParagraph: false,
  toggleTypewriter: () => set((s) => ({ typewriter: !s.typewriter })),
  toggleFocusParagraph: () => set((s) => ({ focusParagraph: !s.focusParagraph })),
  setTypewriter: (typewriter) => set({ typewriter }),
  setFocusParagraph: (focusParagraph) => set({ focusParagraph }),
}));
