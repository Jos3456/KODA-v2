pub mod commands;
pub mod error;
pub mod library;
pub mod metadata;
pub mod platform;
pub mod playback;
pub mod playlists;
pub mod settings;
pub mod state;
pub mod storage;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    platform::init_platform();

    let app_state = match AppState::new() {
        Ok(state) => state,
        Err(err) => {
            eprintln!("Failed to initialize Koda application state: {}", err);
            std::process::exit(1);
        }
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Library commands
            commands::select_music_folder,
            commands::start_library_scan,
            commands::get_library_page,
            commands::get_albums,
            commands::get_artists,
            commands::get_genres,
            // Playback commands
            commands::play_track,
            commands::toggle_playback,
            commands::seek_to,
            commands::set_volume,
            commands::set_repeat_mode,
            commands::set_shuffle,
            commands::get_playback_state,
            commands::get_queue,
            // Playlist commands
            commands::create_playlist,
            commands::get_playlists,
            commands::add_tracks_to_playlist,
            commands::toggle_favourite,
            commands::get_favourites,
            // Settings commands
            commands::get_settings,
            commands::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Koda application");
}
