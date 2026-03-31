import { create } from "zustand";
import { updateAndSave } from "~/lib/storage";

export type LayoutMode = "files" | "reading" | "focus";

interface AppState {
  settingsOpen: boolean;
  layoutMode: LayoutMode;

  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  cycleLayoutMode: () => void;
}

const LAYOUT_CYCLE: LayoutMode[] = ["files", "reading", "focus"];

export const GRID_COLUMNS: Record<LayoutMode, string> = {
  files: "260px 1fr",
  reading: "260px 1fr 220px",
  focus: "1fr",
};

export const useAppStore = create<AppState>((set, get) => ({
  settingsOpen: false,
  layoutMode: "files",

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
}));
