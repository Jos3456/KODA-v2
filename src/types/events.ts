import { Track, LibraryScanProgress } from "./library";
import { PlaybackState } from "./playback";

export interface EventsMap {
  "scan-progress": LibraryScanProgress;
  "scan-completed": { totalTracks: number };
  "library-changed": void;
  "playback-state-changed": PlaybackState;
  "track-changed": Track | null;
  "playback-position": { currentTimeSeconds: number; durationSeconds: number };
  "queue-changed": { currentIndex: number; totalItems: number };
}
