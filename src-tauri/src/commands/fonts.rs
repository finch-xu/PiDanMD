use crate::error::AppError;

#[tauri::command]
pub async fn list_system_fonts() -> Result<Vec<String>, AppError> {
    tokio::task::spawn_blocking(|| {
        let source = font_kit::source::SystemSource::new();
        let mut families = source
            .all_families()
            .map_err(|e| AppError::FontKit(e.to_string()))?;
        families.sort();
        families.dedup();
        Ok(families)
    })
    .await
    .map_err(|e| AppError::FontKit(e.to_string()))?
}
