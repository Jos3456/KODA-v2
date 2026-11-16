export type ThemeMode = "light" | "dark" | "dynamic";

export interface VisibleViews {
  songs: boolean;
  albums: boolean;
  artists: boolean;
  genres: boolean;
  playlists: boolean;
  favourites: boolean;
}

export interface AppSettings {
  version: number;
  musicFolder?: string;
  theme: ThemeMode;
  dynamicColorEnabled: boolean;
  volume: number;
  visibleViews: VisibleViews;
  preferHardwareAcceleration: boolean;
}
