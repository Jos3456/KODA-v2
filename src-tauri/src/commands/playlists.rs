use crate::error::{AppError, AppResult};
use crate::library::Track;
use crate::playlists::{Playlist, PlaylistManager};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn create_playlist(
    state: State<'_, AppState>,
    name: String,
    description: Option<String>,
) -> AppResult<Playlist> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;
    PlaylistManager::create_playlist(&conn, &name, description.as_deref())
}

#[tauri::command]
pub async fn get_playlists(state: State<'_, AppState>) -> AppResult<Vec<Playlist>> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;
    PlaylistManager::get_playlists(&conn)
}

#[tauri::command]
pub async fn add_tracks_to_playlist(
    state: State<'_, AppState>,
    playlist_id: String,
    track_ids: Vec<String>,
) -> AppResult<()> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let mut conn = db_mgr.open_connection()?;
    PlaylistManager::add_tracks_to_playlist(&mut conn, &playlist_id, &track_ids)
}

#[tauri::command]
pub async fn toggle_favourite(state: State<'_, AppState>, track_id: String) -> AppResult<bool> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;
    PlaylistManager::toggle_favourite(&conn, &track_id)
}

#[tauri::command]
pub async fn get_favourites(state: State<'_, AppState>) -> AppResult<Vec<Track>> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let mut stmt = conn.prepare(
        "SELECT t.id, t.file_path, t.title, t.artist, t.album, t.album_artist, t.genre,
                t.year, t.track_number, t.duration_seconds, t.has_artwork,
                t.artwork_cache_key, t.file_size_bytes, t.format, t.date_added
         FROM tracks t
         INNER JOIN favourites f ON t.id = f.track_id
         ORDER BY f.added_at DESC",
    )?;

    let tracks = stmt
        .query_map([], |row| {
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
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tracks)
}
