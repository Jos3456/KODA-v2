import { Track } from "./library";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
}
