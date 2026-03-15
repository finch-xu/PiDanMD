use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::UNIX_EPOCH;
use tauri::{Manager, State};

use crate::state::AppState;

#[derive(Serialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub modified: Option<u64>,
}

/// Validate that `path` resolves to a location inside the current workspace.
fn validate_path(path: &str, state: &State<Mutex<AppState>>) -> Result<PathBuf, String> {
    let canonical = fs::canonicalize(path)
        .or_else(|_| {
            // File/dir may not exist yet — canonicalize parent and append filename
            let p = PathBuf::from(path);
            let parent = p.parent().ok_or("Invalid path")?;
            let name = p.file_name().ok_or("Invalid path")?;
            fs::canonicalize(parent)
                .map(|cp| cp.join(name))
                .map_err(|e| e.to_string())
        })
        .map_err(|e| format!("Path resolution failed: {e}"))?;

    let app_state = state.lock().map_err(|e| e.to_string())?;
    let workspace = app_state
        .workspace_path
        .as_ref()
        .ok_or("No workspace opened")?;
    let ws_canonical = fs::canonicalize(workspace).map_err(|e| e.to_string())?;

    if !canonical.starts_with(&ws_canonical) {
        return Err("Access denied: path outside workspace".into());
    }
    Ok(canonical)
}

#[tauri::command]
pub fn list_directory(path: String, state: State<Mutex<AppState>>) -> Result<Vec<FileEntry>, String> {
    let safe_path = validate_path(&path, &state)?;
    let entries = fs::read_dir(&safe_path).map_err(|e| e.to_string())?;

    let mut files: Vec<FileEntry> = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files (starting with '.')
        if name.starts_with('.') {
            continue;
        }

        let modified = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs());

        files.push(FileEntry {
            name,
            path: entry.path().to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
            modified,
        });
    }

    // Sort: directories first, then alphabetically by name
    files.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(files)
}

#[tauri::command]
pub fn read_file(path: String, state: State<Mutex<AppState>>) -> Result<String, String> {
    let safe_path = validate_path(&path, &state)?;
    fs::read_to_string(&safe_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(path: String, content: String, state: State<Mutex<AppState>>) -> Result<(), String> {
    let safe_path = validate_path(&path, &state)?;
    fs::write(&safe_path, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_directory(path: String, state: State<Mutex<AppState>>) -> Result<(), String> {
    let safe_path = validate_path(&path, &state)?;
    fs::create_dir_all(&safe_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_default_storage_dir(app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let storage = data_dir.join("workspace");
    fs::create_dir_all(&storage).map_err(|e| e.to_string())?;
    Ok(storage.to_string_lossy().to_string())
}
