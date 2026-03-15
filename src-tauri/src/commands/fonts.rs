#[tauri::command]
pub fn list_system_fonts() -> Result<Vec<String>, String> {
    let source = font_kit::source::SystemSource::new();
    let mut families = source.all_families().map_err(|e| e.to_string())?;
    families.sort();
    families.dedup();
    Ok(families)
}
