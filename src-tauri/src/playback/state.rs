use crate::library::Track;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PlaybackStatus {
    Stopped,
    Playing,
    Paused,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RepeatMode {
    Off,
    All,
    One,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaybackState {
    pub status: PlaybackStatus,
    pub current_track: Option<Track>,
    pub current_time_seconds: f64,
    pub duration_seconds: f64,
    pub volume: f32,
    pub is_muted: bool,
    pub is_shuffle: bool,
    pub repeat_mode: RepeatMode,
}

impl Default for PlaybackState {
    fn default() -> Self {
        Self {
            status: PlaybackStatus::Stopped,
            current_track: None,
            current_time_seconds: 0.0,
            duration_seconds: 0.0,
            volume: 0.8,
            is_muted: false,
            is_shuffle: false,
            repeat_mode: RepeatMode::Off,
        }
    }
}
