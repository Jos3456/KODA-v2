use crate::error::{AppError, AppResult};
use crate::storage::migrations::apply_migrations;
use rusqlite::Connection;
use std::path::PathBuf;

pub struct DatabaseManager {
    db_path: PathBuf,
}

impl DatabaseManager {
    pub fn new() -> AppResult<Self> {
        let app_dir = dirs::data_dir()
            .map(|d| d.join("koda"))
            .unwrap_or_else(|| PathBuf::from(".koda"));

        std::fs::create_dir_all(&app_dir)?;
        let db_path = app_dir.join("library.db");

        let mut mgr = Self { db_path };
        mgr.init()?;
        Ok(mgr)
    }

    pub fn new_in_memory() -> AppResult<Connection> {
        let mut conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;
        apply_migrations(&mut conn)?;
        Ok(conn)
    }

    pub fn open_connection(&self) -> AppResult<Connection> {
        let conn = Connection::open(&self.db_path)
            .map_err(|e| AppError::Database(format!("Failed to open database: {}", e)))?;

        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;"
        )?;

        Ok(conn)
    }

    fn init(&mut self) -> AppResult<()> {
        let mut conn = self.open_connection()?;
        apply_migrations(&mut conn)?;
        Ok(())
    }
}
