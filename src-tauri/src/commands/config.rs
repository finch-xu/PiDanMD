use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

// ── Config Structs ──────────────────────────────

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FontEntry {
    pub family: String,
    pub size: u32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FontConfig {
    pub ui: FontEntry,
    pub body: FontEntry,
    pub code: FontEntry,
    #[serde(default = "default_symbol_font")]
    pub symbol: String,
}

fn default_symbol_font() -> String {
    "Noto Color Emoji".into()
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ReadingConfig {
    pub line_height: String,
    pub content_width: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
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
            font: FontConfig {
                ui: FontEntry {
                    family: "LXGW WenKai Screen".into(),
                    size: 16,
                },
                body: FontEntry {
                    family: "LXGW WenKai Screen".into(),
                    size: 16,
                },
                code: FontEntry {
                    family: "Cascadia Code NF".into(),
                    size: 16,
                },
                symbol: "Noto Color Emoji".into(),
            },
            reading: ReadingConfig {
                line_height: "comfortable".into(),
                content_width: "standard".into(),
            },
        }
    }
}

// ── Config Path ─────────────────────────────────

fn config_path() -> PathBuf {
    dirs::home_dir()
        .unwrap()
        .join(".config")
        .join("pidanmd")
        .join("config.yaml")
}

// ── Tauri Commands ──────────────────────────────

#[tauri::command]
pub fn load_config() -> AppConfig {
    let path = config_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(config) = serde_yaml::from_str::<AppConfig>(&content) {
                return config;
            }
        }
    }
    AppConfig::default()
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let yaml = serde_yaml::to_string(&config).map_err(|e| e.to_string())?;
    fs::write(&path, yaml).map_err(|e| e.to_string())?;
    Ok(())
}
