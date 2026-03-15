use std::path::PathBuf;

#[derive(Default)]
pub struct AppState {
    pub workspace_path: Option<PathBuf>,
}
