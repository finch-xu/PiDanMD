import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { loadFullConfig } from "./lib/storage";
import { initLocaleFromConfig } from "./lib/i18n";
import { useSettingsStore } from "./stores/settings-store";
import { useAppStore, type LayoutMode } from "./stores/app-store";
import { useWorkspaceStore } from "./stores/workspace-store";
import "./index.css";

async function init() {
  try {
    // Load config from Tauri backend
    const config = await loadFullConfig();

    // Initialize stores from config
    useSettingsStore.getState().initFromConfig(config);
    initLocaleFromConfig(config.locale);

    // Restore layout mode
    if (config.layout) {
      useAppStore.getState().setLayoutMode(config.layout as LayoutMode);
    }

    // Load default workspace
    await useWorkspaceStore.getState().initWorkspace();
  } catch (e) {
    console.error("Failed to initialize:", e);
  }

  // Mount React app
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();
