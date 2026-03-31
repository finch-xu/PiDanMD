import { create } from "zustand";
import { readFile, writeFile } from "~/lib/tauri";

interface EditorState {
  content: string;
  filePath: string | null;
  isDirty: boolean;
  isLoading: boolean;

  loadFile: (path: string) => Promise<void>;
  setContent: (content: string) => void;
  saveFile: () => Promise<void>;
  clearEditor: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  content: "",
  filePath: null,
  isDirty: false,
  isLoading: false,

  loadFile: async (path) => {
    set({ isLoading: true });
    try {
      const text = await readFile(path);
      set({ content: text, filePath: path, isDirty: false, isLoading: false });
    } catch (e) {
      console.error("Failed to load file:", e);
      set({ isLoading: false });
    }
  },

  setContent: (content) => {
    set({ content, isDirty: true });

    // Debounced auto-save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      get().saveFile();
    }, 1000);
  },

  saveFile: async () => {
    const { filePath, content, isDirty } = get();
    if (!filePath || !isDirty) return;
    try {
      await writeFile(filePath, content);
      set({ isDirty: false });
    } catch (e) {
      console.error("Failed to save file:", e);
    }
  },

  clearEditor: () => {
    if (saveTimer) clearTimeout(saveTimer);
    set({ content: "", filePath: null, isDirty: false, isLoading: false });
  },
}));
