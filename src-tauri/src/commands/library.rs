use crate::error::{AppError, AppResult};
use crate::library::{scan_folder, Album, Artist, Genre, LibraryPage, LibraryScanProgress, Track};
use crate::state::AppState;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub async fn select_music_folder(app: AppHandle) -> AppResult<Option<String>> {
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn start_library_scan(app: AppHandle, state: State<'_, AppState>) -> AppResult<()> {
    let folder_opt = state
        .settings
        .read()
        .map_err(|e| AppError::InvalidState(e.to_string()))?
        .music_folder
        .clone();

    let folder_str = match folder_opt {
        Some(f) => f,
        None => {
            return Err(AppError::InvalidPath(
                "No music folder configured".to_string(),
            ))
        }
    };

    let folder_path = PathBuf::from(&folder_str);
    let db = state.db.clone();

    // Run scanning in a blocking worker thread
    tauri::async_runtime::spawn_blocking(move || -> AppResult<()> {
        let db_mgr = db
            .lock()
            .map_err(|e| AppError::InvalidState(e.to_string()))?;
        let mut conn = db_mgr.open_connection()?;

        let app_handle = app.clone();
        let total = scan_folder(&folder_path, &mut conn, move |scanned, discovered| {
            let progress = LibraryScanProgress {
                scanned_files: scanned,
                discovered_tracks: discovered,
                current_folder: Some(folder_str.clone()),
                is_complete: false,
                error: None,
            };
            let _ = app_handle.emit("scan-progress", progress);
        })?;

        let _ = app.emit(
            "scan-completed",
            serde_json::json!({ "totalTracks": total }),
        );
        let _ = app.emit("library-changed", ());

        Ok(())
    });

    Ok(())
}

#[tauri::command]
pub async fn get_library_page(
    state: State<'_, AppState>,
    page: u32,
    page_size: u32,
) -> AppResult<LibraryPage> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let total_count: u32 = conn
        .query_row("SELECT COUNT(*) FROM tracks", [], |row| row.get(0))
        .unwrap_or(0);

    let offset = page * page_size;
    let mut stmt = conn.prepare(
        "SELECT id, file_path, title, artist, album, album_artist, genre, year,
                track_number, duration_seconds, has_artwork, artwork_cache_key,
                file_size_bytes, format, date_added
         FROM tracks
         ORDER BY title ASC
         LIMIT ?1 OFFSET ?2",
    )?;

    let tracks = stmt
        .query_map([page_size, offset], |row| {
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

    Ok(LibraryPage {
        tracks,
        total_count,
        page,
        page_size,
    })
}

#[tauri::command]
pub async fn get_albums(state: State<'_, AppState>) -> AppResult<Vec<Album>> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let mut stmt = conn.prepare(
        "SELECT album, artist, year, COUNT(id) as track_count, MAX(has_artwork)
         FROM tracks
         GROUP BY album, artist
         ORDER BY album ASC",
    )?;

    let albums = stmt
        .query_map([], |row| {
            let album: String = row.get(0)?;
            let artist: String = row.get(1)?;
            let id = format!("{}-{}", album, artist);
            Ok(Album {
                id,
                title: album,
                artist,
                year: row.get(2)?,
                track_count: row.get(3)?,
                has_artwork: row.get::<_, i64>(4)? == 1,
                artwork_cache_key: None,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(albums)
}

#[tauri::command]
pub async fn get_artists(state: State<'_, AppState>) -> AppResult<Vec<Artist>> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let mut stmt = conn.prepare(
        "SELECT artist, COUNT(DISTINCT album) as album_count, COUNT(id) as track_count
         FROM tracks
         GROUP BY artist
         ORDER BY artist ASC",
    )?;

    let artists = stmt
        .query_map([], |row| {
            let name: String = row.get(0)?;
            Ok(Artist {
                id: name.clone(),
                name,
                album_count: row.get(1)?,
                track_count: row.get(2)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(artists)
}

#[tauri::command]
pub async fn get_genres(state: State<'_, AppState>) -> AppResult<Vec<Genre>> {
    let db_mgr = state
        .db
        .lock()
        .map_err(|e| AppError::InvalidState(e.to_string()))?;
    let conn = db_mgr.open_connection()?;

    let mut stmt = conn.prepare(
        "SELECT genre, COUNT(id) as track_count
         FROM tracks
         WHERE genre IS NOT NULL AND genre != ''
         GROUP BY genre
         ORDER BY genre ASC",
    )?;

    let genres = stmt
        .query_map([], |row| {
            let name: String = row.get(0)?;
            Ok(Genre {
                id: name.clone(),
                name,
                track_count: row.get(1)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(genres)
}
