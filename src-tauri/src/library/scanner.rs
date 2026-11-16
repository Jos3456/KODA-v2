use crate::error::{AppError, AppResult};
use crate::metadata::extract_metadata;
use rusqlite::{params, Connection};
use std::path::Path;
use uuid::Uuid;
use walkdir::WalkDir;

const SUPPORTED_EXTENSIONS: &[&str] = &[
    "mp3", "flac", "wav", "aac", "ogg", "m4a", "opus", "aiff", "aif",
];

pub fn is_supported_audio_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| {
            let lower = ext.to_lowercase();
            SUPPORTED_EXTENSIONS.contains(&lower.as_str())
        })
        .unwrap_or(false)
}

pub fn scan_folder<F>(
    folder_path: &Path,
    conn: &mut Connection,
    mut on_progress: F,
) -> AppResult<u32>
where
    F: FnMut(u32, u32), // (scanned_count, discovered_count)
{
    if !folder_path.exists() || !folder_path.is_dir() {
        return Err(AppError::InvalidPath(format!(
            "Folder does not exist or is not a directory: {:?}",
            folder_path
        )));
    }

    let mut scanned_count = 0u32;
    let mut discovered_count = 0u32;
    let now = chrono::Utc::now().to_rfc3339();

    let tx = conn.transaction()?;

    for entry in WalkDir::new(folder_path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            scanned_count += 1;

            if is_supported_audio_file(path) {
                let file_path_str = path.to_string_lossy().to_string();
                let file_size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                let format = path
                    .extension()
                    .and_then(|s| s.to_str())
                    .unwrap_or("unknown")
                    .to_lowercase();

                // Check if track already exists by file_path
                let existing_id: Option<String> = tx
                    .query_row(
                        "SELECT id FROM tracks WHERE file_path = ?1",
                        params![&file_path_str],
                        |row| row.get(0),
                    )
                    .ok();

                if existing_id.is_none() {
                    // Extract metadata
                    if let Ok(meta) = extract_metadata(path) {
                        let id = Uuid::new_v4().to_string();

                        tx.execute(
                            "INSERT INTO tracks (
                                id, file_path, title, artist, album, album_artist,
                                genre, year, track_number, duration_seconds,
                                has_artwork, file_size_bytes, format, date_added
                            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                            params![
                                id,
                                file_path_str,
                                meta.title,
                                meta.artist,
                                meta.album,
                                meta.album_artist,
                                meta.genre,
                                meta.year,
                                meta.track_number,
                                meta.duration_seconds,
                                if meta.has_artwork { 1 } else { 0 },
                                file_size as i64,
                                format,
                                now,
                            ],
                        )?;

                        discovered_count += 1;
                    }
                }
            }

            if scanned_count.is_multiple_of(25) {
                on_progress(scanned_count, discovered_count);
            }
        }
    }

    tx.commit()?;
    on_progress(scanned_count, discovered_count);

    Ok(discovered_count)
}
