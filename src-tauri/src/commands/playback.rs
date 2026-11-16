use crate::error::{AppError, AppResult};
use crate::library::Track;
use crate::playback::{PlaybackState, RepeatMode};
use crate::state::AppState;
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub async fn play_track(
    app: AppHandle,
    state: State<'_, AppState>,
    track_id: String,
) -> AppResult<()> {
    // 1. Fetch track from db
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let track = conn
        .query_row(
            "SELECT id, file_path, title, artist, album, album_artist, genre, year,
                track_number, duration_seconds, has_artwork, artwork_cache_key,
                file_size_bytes, format, date_added
         FROM tracks WHERE id = ?1",
            [&track_id],
            |row| {
                Ok(Track {
                    id: row.get(0)?,
                    file_path: row.get(1)?,
                    title: row.get(2)?,
                    artist: row.get(3)?,
                    album: row.get(4)?,
                    album_artist: row.get(5)?,
                    genre: row.get(6)?,
                    year: row.get(7)?,
                    track_number: row.get(8)?,
                    duration_seconds: row.get(9)?,
                    has_artwork: row.get::<_, i64>(10)? == 1,
                    artwork_cache_key: row.get(11)?,
                    file_size_bytes: row.get(12)?,
                    format: row.get(13)?,
                    date_added: row.get(14)?,
                })
            },
        )
        .map_err(|_| AppError::NotFound(format!("Track not found: {}", track_id)))?;

    drop(conn);
    drop(db_mgr);

    let mut player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    player.play_track(track.clone())?;

    let _ = app.emit("track-changed", &track);
    let _ = app.emit("playback-state-changed", &player.state);

    Ok(())
}

#[tauri::command]
pub async fn toggle_playback(app: AppHandle, state: State<'_, AppState>) -> AppResult<()> {
    let mut player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    player.toggle_playback()?;

    let _ = app.emit("playback-state-changed", &player.state);
    Ok(())
}

#[tauri::command]
pub async fn seek_to(_state: State<'_, AppState>, _position_seconds: f64) -> AppResult<()> {
    // Seeking will be fully wired with Symphonia/Rodio seek decoder
    Ok(())
}

#[tauri::command]
pub async fn set_volume(state: State<'_, AppState>, volume: f32) -> AppResult<()> {
    let mut player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    player.set_volume(volume);
    Ok(())
}

#[tauri::command]
pub async fn set_repeat_mode(state: State<'_, AppState>, repeat_mode: RepeatMode) -> AppResult<()> {
    let mut player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    player.set_repeat_mode(repeat_mode);
    Ok(())
}

#[tauri::command]
pub async fn set_shuffle(state: State<'_, AppState>, shuffle: bool) -> AppResult<()> {
    let mut player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    player.set_shuffle(shuffle);
    Ok(())
}

#[tauri::command]
pub async fn get_playback_state(state: State<'_, AppState>) -> AppResult<PlaybackState> {
    let player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    Ok(player.state.clone())
}

#[tauri::command]
pub async fn get_queue(state: State<'_, AppState>) -> AppResult<Vec<Track>> {
    let player = state
        .player
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    Ok(player.queue.get_items().to_vec())
}
