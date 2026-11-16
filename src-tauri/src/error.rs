use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("I/O error: {0}")]
    Io(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Metadata extraction error: {0}")]
    Metadata(String),

    #[error("Playback error: {0}")]
    Playback(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid path: {0}")]
    InvalidPath(String),

    #[error("Invalid state: {0}")]
    InvalidState(String),
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
