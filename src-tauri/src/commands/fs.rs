use serde::Serialize;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;
use tauri::{Manager, State};
use tokio::sync::Mutex;

use crate::error::AppError;
use crate::state::AppState;

#[derive(Serialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub modified: Option<u64>,
}

/// Resolve a path string into a canonical `PathBuf`.
/// For paths that don't exist yet, canonicalize the parent and append the filename.
fn resolve_path(path: &str) -> Result<PathBuf, AppError> {
    std::fs::canonicalize(path).or_else(|_| {
        let p = PathBuf::from(path);
        let parent = p
            .parent()
            .ok_or_else(|| AppError::InvalidPath("no parent".into()))?;
        let name = p
            .file_name()
            .ok_or_else(|| AppError::InvalidPath("no filename".into()))?;
        Ok(std::fs::canonicalize(parent)?.join(name))
    })
}

/// Validate that `path` resolves to a location inside the current workspace.
async fn validate_path(
    path: &str,
    state: &State<'_, Mutex<AppState>>,
) -> Result<PathBuf, AppError> {
    let canonical = resolve_path(path)?;

    let app_state = state.lock().await;
    let workspace = app_state
        .workspace_path
        .as_ref()
        .ok_or(AppError::NoWorkspace)?;
    let ws_canonical = std::fs::canonicalize(workspace)?;

    if !canonical.starts_with(&ws_canonical) {
        return Err(AppError::PathTraversal(canonical.display().to_string()));
    }
    Ok(canonical)
}

#[tauri::command]
pub async fn list_directory(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<FileEntry>, AppError> {
    let canonical = resolve_path(&path)?;

    // Auto-set workspace path — the frontend's "open workspace" IS listing a directory.
    {
        let mut app_state = state.lock().await;
        app_state.workspace_path = Some(canonical.clone());
    }

    let mut reader = tokio::fs::read_dir(&canonical).await?;
    let mut files: Vec<FileEntry> = Vec::new();

    while let Some(entry) = reader.next_entry().await? {
        let metadata = entry.metadata().await?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files
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

    // Sort: directories first, then alphabetically
    files.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(files)
}

#[tauri::command]
pub async fn read_file(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, AppError> {
    let safe_path = validate_path(&path, &state).await?;
    Ok(tokio::fs::read_to_string(&safe_path).await?)
}

#[tauri::command]
pub async fn write_file(
    path: String,
    content: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), AppError> {
    let safe_path = validate_path(&path, &state).await?;
    Ok(tokio::fs::write(&safe_path, &content).await?)
}

#[tauri::command]
pub async fn create_directory(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), AppError> {
    let safe_path = validate_path(&path, &state).await?;
    Ok(tokio::fs::create_dir_all(&safe_path).await?)
}

#[tauri::command]
pub async fn rename_entry(
    old_path: String,
    new_path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), AppError> {
    let safe_old = validate_path(&old_path, &state).await?;
    let safe_new = validate_path(&new_path, &state).await?;
    Ok(tokio::fs::rename(&safe_old, &safe_new).await?)
}

#[tauri::command]
pub async fn delete_entry(
    path: String,
    is_directory: bool,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), AppError> {
    let safe_path = validate_path(&path, &state).await?;
    if is_directory {
        tokio::fs::remove_dir_all(&safe_path).await?;
    } else {
        tokio::fs::remove_file(&safe_path).await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_default_storage_dir(app: tauri::AppHandle) -> Result<String, AppError> {
    let data_dir = app.path().app_data_dir().map_err(|e| AppError::Io(
        std::io::Error::new(std::io::ErrorKind::NotFound, e.to_string()),
    ))?;
    let storage = data_dir.join("workspace");
    tokio::fs::create_dir_all(&storage).await?;
    Ok(storage.to_string_lossy().to_string())
}
