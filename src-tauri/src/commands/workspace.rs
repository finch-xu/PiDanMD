use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use crate::state::AppState;

#[tauri::command]
pub fn open_workspace(path: String, state: State<Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.workspace_path = Some(PathBuf::from(path));
    Ok(())
}
