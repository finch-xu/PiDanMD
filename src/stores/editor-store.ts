import { create } from "zustand";
import { readFile, writeFile } from "~/lib/tauri";

type EditorMode = "wysiwyg" | "source" | "preview";

interface EditorState {
  content: string;
  filePath: string | null;
  isDirty: boolean;
  isLoading: boolean;
  editorMode: EditorMode;

  loadFile: (path: string) => Promise<void>;
  setContent: (content: string) => void;
  saveFile: () => Promise<void>;
  clearEditor: () => void;
  toggleEditorMode: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  content: "",
  filePath: null,
  isDirty: false,
  isLoading: false,
  editorMode: "wysiwyg" as EditorMode,

  loadFile: async (path) => {
    // Save current dirty file before switching
    const { isDirty } = get();
    if (isDirty) await get().saveFile();

    // Cancel any pending auto-save from the previous file
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }

    // Set loading state — do NOT clear content (isLoading prevents effects from acting)
    set({ filePath: path, isLoading: true, isDirty: false });
    try {
      const text = await readFile(path);
      if (get().filePath !== path) return; // stale: user clicked another file
      set({ content: text, isDirty: false, isLoading: false });
    } catch (e) {
      console.error("Failed to load file:", e);
      if (get().filePath !== path) return;
      set({ content: "", filePath: null, isDirty: false, isLoading: false });
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
    const { filePath, content, isDirty, isLoading } = get();
    if (!filePath || !isDirty || isLoading) return;
    try {
      await writeFile(filePath, content);
      set({ isDirty: false });
    } catch (e) {
      console.error("Failed to save file:", e);
    }
  },

  clearEditor: () => {
    if (saveTimer) clearTimeout(saveTimer);
    set({ content: "", filePath: null, isDirty: false, isLoading: false, editorMode: "wysiwyg" });
  },

  toggleEditorMode: () => {
    const cycle: EditorMode[] = ["wysiwyg", "source", "preview"];
    set((s) => {
      const idx = cycle.indexOf(s.editorMode);
      return { editorMode: cycle[(idx + 1) % cycle.length] };
    });
  },
}));
