use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

use crate::error::AppError;

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
                family: "LXGW WenKai Mono Screen".into(),
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
    pub appearance: String,
    pub light_theme: String,
    pub dark_theme: String,
    pub locale: String,
    pub layout: String,
    pub font: FontConfig,
    pub reading: ReadingConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            appearance: "system".into(),
            light_theme: "default-light".into(),
            dark_theme: "default-dark".into(),
            locale: "zh-CN".into(),
            layout: "focus".into(),
            font: FontConfig::default(),
            reading: ReadingConfig::default(),
        }
    }
}

// ── Config Path ─────────────────────────────────

fn config_path(app: &tauri::AppHandle) -> Result<PathBuf, AppError> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppError::Io(std::io::Error::new(std::io::ErrorKind::NotFound, e.to_string())))?;
    Ok(dir.join("config.yaml"))
}

// ── Config I/O ─────────────────────────────────

async fn save_config_inner(path: &PathBuf, config: &AppConfig) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    let yaml = serde_yaml::to_string(config)?;
    tokio::fs::write(path, yaml).await?;
    Ok(())
}

// ── Tauri Commands ──────────────────────────────

#[tauri::command]
pub async fn load_config(app: tauri::AppHandle) -> AppConfig {
    let path = match config_path(&app) {
        Ok(p) => p,
        Err(_) => return AppConfig::default(),
    };

    let config = match tokio::fs::read_to_string(&path).await {
        Ok(content) => serde_yaml::from_str::<AppConfig>(&content).unwrap_or_default(),
        Err(_) => AppConfig::default(),
    };

    // Write back to ensure any new fields are persisted
    let _ = save_config_inner(&path, &config).await;
    config
}

#[tauri::command]
pub async fn save_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), AppError> {
    let path = config_path(&app)?;
    save_config_inner(&path, &config).await
}

#[tauri::command]
pub async fn reset_config(app: tauri::AppHandle) -> Result<AppConfig, AppError> {
    let path = config_path(&app)?;
    let config = AppConfig::default();
    save_config_inner(&path, &config).await?;
    Ok(config)
}
