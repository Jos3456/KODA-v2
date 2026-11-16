import { Track, LibraryPage, Album, Artist, Genre } from "@/types/library";
import { PlaybackState, RepeatMode } from "@/types/playback";
import { Playlist, PlaylistWithTracks } from "@/types/playlists";
import { AppSettings } from "@/types/settings";

// Helper to safely invoke Tauri commands with graceful fallback in browser
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(cmd, args);
  }
  console.warn(`[Tauri Mock] Invoking '${cmd}' with args:`, args);
  return {} as T;
}

export const api = {
  // Library commands
  selectMusicFolder: (): Promise<string | null> => invoke<string | null>("select_music_folder"),
  startLibraryScan: (): Promise<void> => invoke<void>("start_library_scan"),
  getLibraryPage: (page = 0, pageSize = 100): Promise<LibraryPage> =>
    invoke<LibraryPage>("get_library_page", { page, pageSize }),
  getAlbums: (): Promise<Album[]> => invoke<Album[]>("get_albums"),
  getArtists: (): Promise<Artist[]> => invoke<Artist[]>("get_artists"),
  getGenres: (): Promise<Genre[]> => invoke<Genre[]>("get_genres"),
  getAlbumDetails: (albumId: string): Promise<Track[]> =>
    invoke<Track[]>("get_album_details", { albumId }),
  getArtistDetails: (artistId: string): Promise<Track[]> =>
    invoke<Track[]>("get_artist_details", { artistId }),

  // Playback commands
  playTrack: (trackId: string): Promise<void> => invoke<void>("play_track", { trackId }),
  togglePlayback: (): Promise<void> => invoke<void>("toggle_playback"),
  seekTo: (positionSeconds: number): Promise<void> =>
    invoke<void>("seek_to", { positionSeconds }),
  setVolume: (volume: number): Promise<void> => invoke<void>("set_volume", { volume }),
  setRepeatMode: (repeatMode: RepeatMode): Promise<void> =>
    invoke<void>("set_repeat_mode", { repeatMode }),
  setShuffle: (shuffle: boolean): Promise<void> => invoke<void>("set_shuffle", { shuffle }),
  getPlaybackState: (): Promise<PlaybackState> => invoke<PlaybackState>("get_playback_state"),
  getQueue: (): Promise<Track[]> => invoke<Track[]>("get_queue"),

  // Playlist commands
  getPlaylists: (): Promise<Playlist[]> => invoke<Playlist[]>("get_playlists"),
  createPlaylist: (name: string, description?: string): Promise<Playlist> =>
    invoke<Playlist>("create_playlist", { name, description }),
  addTracksToPlaylist: (playlistId: string, trackIds: string[]): Promise<void> =>
    invoke<void>("add_tracks_to_playlist", { playlistId, trackIds }),
  getPlaylistWithTracks: (playlistId: string): Promise<PlaylistWithTracks> =>
    invoke<PlaylistWithTracks>("get_playlist_with_tracks", { playlistId }),
  toggleFavourite: (trackId: string): Promise<boolean> =>
    invoke<boolean>("toggle_favourite", { trackId }),
  getFavourites: (): Promise<Track[]> => invoke<Track[]>("get_favourites"),

  // Settings commands
  getSettings: (): Promise<AppSettings> => invoke<AppSettings>("get_settings"),
  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    invoke<AppSettings>("update_settings", { settings }),
};
