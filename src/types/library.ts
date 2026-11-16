export interface Track {
  id: string;
  filePath: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  durationSeconds: number;
  hasArtwork: boolean;
  artworkCacheKey?: string;
  fileSizeBytes: number;
  format: string;
  dateAdded: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  trackCount: number;
  hasArtwork: boolean;
  artworkCacheKey?: string;
}

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  trackCount: number;
}

export interface Genre {
  id: string;
  name: string;
  trackCount: number;
}

export interface LibraryScanProgress {
  scannedFiles: number;
  discoveredTracks: number;
  currentFolder?: string;
  isComplete: boolean;
  error?: string;
}

export interface LibraryPage {
  tracks: Track[];
  totalCount: number;
  page: number;
  pageSize: number;
}
