mod commands;
mod menu;
mod state;

use std::sync::Mutex;
use state::AppState;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            commands::fs::list_directory,
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::create_directory,
            commands::fs::write_binary_file,
            commands::fs::copy_file,
            commands::fs::rename_entry,
            commands::fs::delete_entry,
            commands::fs::get_default_storage_dir,
            commands::workspace::open_workspace,
            commands::fonts::list_system_fonts,
            commands::config::load_config,
            commands::config::save_config,
            commands::config::reset_config,
        ])
        .setup(|app| {
            let menu = menu::build_menu(app)?;
            app.set_menu(menu)?;
            app.on_menu_event(|app, event| {
                let _ = app.emit("menu-action", event.id().0.as_str());
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
