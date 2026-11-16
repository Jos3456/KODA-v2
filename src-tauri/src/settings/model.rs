use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisibleViews {
    pub songs: bool,
    pub albums: bool,
    pub artists: bool,
    pub genres: bool,
    pub playlists: bool,
    pub favourites: bool,
}

impl Default for VisibleViews {
    fn default() -> Self {
        Self {
            songs: true,
            albums: true,
            artists: true,
            genres: true,
            playlists: true,
            favourites: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub version: u32,
    pub music_folder: Option<String>,
    pub theme: String, // "light", "dark", "dynamic"
    pub dynamic_color_enabled: bool,
    pub volume: f32, // 0.0 to 1.0
    pub visible_views: VisibleViews,
    pub prefer_hardware_acceleration: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            version: 1,
            music_folder: None,
            theme: "light".to_string(),
            dynamic_color_enabled: false,
            volume: 0.8,
            visible_views: VisibleViews::default(),
            prefer_hardware_acceleration: true,
        }
    }
}
