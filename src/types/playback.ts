import { Track } from "./library";

export type PlaybackStatus = "stopped" | "playing" | "paused";

export type RepeatMode = "off" | "all" | "one";

export interface PlaybackState {
  status: PlaybackStatus;
  currentTrack?: Track;
  currentTimeSeconds: number;
  durationSeconds: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
}

export interface QueueState {
  items: Track[];
  currentIndex: number;
  shuffleOrder: number[];
}
