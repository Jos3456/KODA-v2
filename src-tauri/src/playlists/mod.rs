use crate::error::AppResult;
use crate::library::Track;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub track_count: u32,
    pub cover_image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistWithTracks {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub track_count: u32,
    pub cover_image: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub tracks: Vec<Track>,
}

pub struct PlaylistManager;

impl PlaylistManager {
    pub fn create_playlist(
        conn: &Connection,
        name: &str,
        description: Option<&str>,
    ) -> AppResult<Playlist> {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO playlists (id, name, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, name, description, now, now],
        )?;

        Ok(Playlist {
            id,
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            track_count: 0,
            cover_image: None,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn get_playlists(conn: &Connection) -> AppResult<Vec<Playlist>> {
        let mut stmt = conn.prepare(
            "SELECT p.id, p.name, p.description, p.created_at, p.updated_at,
                    COUNT(pt.track_id) as track_count
             FROM playlists p
             LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
             GROUP BY p.id
             ORDER BY p.name ASC",
        )?;

        let playlists = stmt
            .query_map([], |row| {
                Ok(Playlist {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                    track_count: row.get(5)?,
                    cover_image: None,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(playlists)
    }

    pub fn add_tracks_to_playlist(
        conn: &mut Connection,
        playlist_id: &str,
        track_ids: &[String],
    ) -> AppResult<()> {
        let tx = conn.transaction()?;
        let current_max_pos: i64 = tx
            .query_row(
                "SELECT COALESCE(MAX(position), -1) FROM playlist_tracks WHERE playlist_id = ?1",
                params![playlist_id],
                |row| row.get(0),
            )
            .unwrap_or(-1);

        for (next_pos, track_id) in (current_max_pos + 1..).zip(track_ids.iter()) {
            tx.execute(
                "INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?1, ?2, ?3)",
                params![playlist_id, track_id, next_pos],
            )?;
        }

        let now = chrono::Utc::now().to_rfc3339();
        tx.execute(
            "UPDATE playlists SET updated_at = ?1 WHERE id = ?2",
            params![now, playlist_id],
        )?;

        tx.commit()?;
        Ok(())
    }

    pub fn toggle_favourite(conn: &Connection, track_id: &str) -> AppResult<bool> {
        let exists: bool = conn
            .query_row(
                "SELECT 1 FROM favourites WHERE track_id = ?1",
                params![track_id],
                |_| Ok(true),
            )
            .unwrap_or(false);

        if exists {
            conn.execute(
                "DELETE FROM favourites WHERE track_id = ?1",
                params![track_id],
            )?;
            Ok(false)
        } else {
            let now = chrono::Utc::now().to_rfc3339();
            conn.execute(
                "INSERT INTO favourites (track_id, added_at) VALUES (?1, ?2)",
                params![track_id, now],
            )?;
            Ok(true)
        }
    }
}
