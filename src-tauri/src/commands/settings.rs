use crate::error::{AppError, AppResult};
use crate::settings::AppSettings;
use crate::state::AppState;
use rusqlite::params;
use tauri::State;

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> AppResult<AppSettings> {
    let settings = state
        .settings
        .read()
        .map_err(|e| AppError::InvalidState(e.to_string()))?
        .clone();
    Ok(settings)
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    settings: serde_json::Value,
) -> AppResult<AppSettings> {
    let mut current = state
        .settings
        .write()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;

    if let Some(folder) = settings.get("musicFolder").and_then(|v| v.as_str()) {
        current.music_folder = Some(folder.to_string());
    }
    if let Some(theme) = settings.get("theme").and_then(|v| v.as_str()) {
        current.theme = theme.to_string();
    }
    if let Some(dynamic) = settings
        .get("dynamicColorEnabled")
        .and_then(|v| v.as_bool())
    {
        current.dynamic_color_enabled = dynamic;
    }
    if let Some(volume) = settings.get("volume").and_then(|v| v.as_f64()) {
        current.volume = volume as f32;
    }

    // Persist to database
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;
    let serialized = serde_json::to_string(&*current)
        .map_err(|e| AppError::Database(format!("Serialization error: {}", e)))?;

    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('app_settings', ?1)",
        params![serialized],
    )?;

    Ok(current.clone())
}
