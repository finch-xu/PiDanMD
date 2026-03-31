use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// ── Config Structs ──────────────────────────────
//
// These are the **single source of truth** for all default values.
// The frontend loads config from the backend on startup and does not
// carry its own defaults.

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct FontEntry {
    pub family: String,
    pub size: u32,
}

impl Default for FontEntry {
    fn default() -> Self {
        Self {
            family: String::new(),
            size: 16,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct FontConfig {
    pub ui: FontEntry,
    pub body: FontEntry,
    pub code: FontEntry,
}

impl Default for FontConfig {
    fn default() -> Self {
        Self {
            ui: FontEntry {
                family: "LXGW WenKai Screen".into(),
                size: 14,
            },
            body: FontEntry {
                family: "LXGW WenKai Screen".into(),
                size: 16,
            },
            code: FontEntry {
                family: "Cascadia Code NF".into(),
                size: 14,
            },
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct ReadingConfig {
    pub line_height: String,
    pub content_width: String,
    pub rendering_mode: String,
}

impl Default for ReadingConfig {
    fn default() -> Self {
        Self {
            line_height: "comfortable".into(),
            content_width: "standard".into(),
            rendering_mode: "default".into(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct AppConfig {
    pub theme: String,
    pub locale: String,
    pub layout: String,
    pub font: FontConfig,
    pub reading: ReadingConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "system".into(),
            locale: "zh-CN".into(),
            layout: "files".into(),
            font: FontConfig::default(),
            reading: ReadingConfig::default(),
        }
    }
}

// ── Config Path ─────────────────────────────────

fn config_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("config.yaml"))
}

// ── Config I/O ─────────────────────────────────

fn save_config_inner(path: &PathBuf, config: &AppConfig) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let yaml = serde_yaml::to_string(config).map_err(|e| e.to_string())?;
    fs::write(path, yaml).map_err(|e| e.to_string())?;
    Ok(())
}

// ── Tauri Commands ──────────────────────────────

#[tauri::command]
pub fn load_config(app: tauri::AppHandle) -> AppConfig {
    let path = match config_path(&app) {
        Ok(p) => p,
        Err(_) => return AppConfig::default(),
    };

    let config = fs::read_to_string(&path)
        .ok()
        .and_then(|c| serde_yaml::from_str::<AppConfig>(&c).ok())
        .unwrap_or_default();

    // Write back to ensure any new fields are persisted
    let _ = save_config_inner(&path, &config);
    config
}

#[tauri::command]
pub fn save_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    let path = config_path(&app)?;
    save_config_inner(&path, &config)
}

#[tauri::command]
pub fn reset_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let path = config_path(&app)?;
    let config = AppConfig::default();
    save_config_inner(&path, &config)?;
    Ok(config)
}
