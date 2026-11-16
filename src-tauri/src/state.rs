use crate::error::AppResult;
use crate::playback::AudioPlayer;
use crate::settings::AppSettings;
use crate::storage::DatabaseManager;
use std::sync::{Arc, Mutex, RwLock};

pub struct AppState {
    pub db: Arc<Mutex<DatabaseManager>>,
    pub settings: Arc<RwLock<AppSettings>>,
    pub player: Arc<Mutex<AudioPlayer>>,
}

impl AppState {
    pub fn new() -> AppResult<Self> {
        let db_mgr = DatabaseManager::new()?;
        let player = AudioPlayer::new();
        let settings = AppSettings::default();

        Ok(Self {
            db: Arc::new(Mutex::new(db_mgr)),
            settings: Arc::new(RwLock::new(settings)),
            player: Arc::new(Mutex::new(player)),
        })
    }
}
