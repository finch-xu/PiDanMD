use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// ── Config Structs ──────────────────────────────

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
    pub symbol: String,
}

impl Default for FontConfig {
    fn default() -> Self {
        Self {
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

// ── Default from YAML ───────────────────────────

const DEFAULT_CONFIG_YAML: &str = include_str!("../../config.default.yaml");

fn default_from_yaml() -> AppConfig {
    serde_yaml::from_str(DEFAULT_CONFIG_YAML).unwrap_or_default()
}

// ── Config Path ─────────────────────────────────

fn config_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("config.yaml"))
}

/// 旧配置路径（~/.config/pidanmd/config.yaml），用于一次性迁移
fn legacy_config_path() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".config").join("pidanmd").join("config.yaml"))
}

/// 若旧路径存在配置文件且新路径不存在，则迁移过来并删除旧文件
fn migrate_legacy_config(app: &tauri::AppHandle) {
    let new_path = match config_path(app) {
        Ok(p) => p,
        Err(_) => return,
    };
    if new_path.exists() {
        return;
    }
    if let Some(old_path) = legacy_config_path() {
        if old_path.exists() {
            if let Some(parent) = new_path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            if fs::copy(&old_path, &new_path).is_ok() {
                let _ = fs::remove_file(&old_path);
            }
        }
    }
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
    migrate_legacy_config(&app);
    let path = match config_path(&app) {
        Ok(p) => p,
        Err(_) => return default_from_yaml(),
    };

    let config = fs::read_to_string(&path)
        .ok()
        .and_then(|c| serde_yaml::from_str::<AppConfig>(&c).ok())
        .unwrap_or_else(default_from_yaml);

    // 首次创建或补充新字段，都回写一次
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
    let config = default_from_yaml();
    save_config_inner(&path, &config)?;
    Ok(config)
}
