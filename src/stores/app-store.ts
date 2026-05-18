import { create } from "zustand";
import { updateAndSave } from "~/lib/storage";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type LayoutMode = "files" | "reading" | "focus";

interface AppState {
  settingsOpen: boolean;
  layoutMode: LayoutMode;
  isFullscreen: boolean;

  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  cycleLayoutMode: () => void;
  toggleFullscreen: () => Promise<void>;
}

const LAYOUT_CYCLE: LayoutMode[] = ["files", "reading", "focus"];

export const GRID_COLUMNS: Record<LayoutMode, string> = {
  files: "260px 1fr",
  reading: "260px 1fr 220px",
  focus: "1fr",
};

export const useAppStore = create<AppState>((set, get) => ({
  settingsOpen: false,
  layoutMode: "focus",
  isFullscreen: false,

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),

  setLayoutMode: (mode) => {
    set({ layoutMode: mode });
    updateAndSave((c) => {
      c.layout = mode;
    });
  },

  cycleLayoutMode: () => {
    const current = get().layoutMode;
    const idx = LAYOUT_CYCLE.indexOf(current);
    const next = LAYOUT_CYCLE[(idx + 1) % LAYOUT_CYCLE.length];
    get().setLayoutMode(next);
  },

  toggleFullscreen: async () => {
    try {
      const win = getCurrentWindow();
      const current = await win.isFullscreen();
      await win.setFullscreen(!current);
      set({ isFullscreen: !current });
    } catch (e) {
      console.error("Fullscreen toggle failed:", e);
    }
  },
}));
