import { PlaybackState } from "@/types/playback";

export interface PlayerOptions {
  onTogglePlayback?: () => void;
  onSeek?: (seconds: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShowQueue?: () => void;
  onShowTrackInfo?: () => void;
  onAddToPlaylist?: () => void;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] as string);

export class Player {
  private container: HTMLElement;
  private options: PlayerOptions;
  private state: PlaybackState = {
    status: "stopped",
    currentTimeSeconds: 0,
    durationSeconds: 0,
    volume: 0.8,
    isMuted: false,
    isShuffle: false,
    repeatMode: "off",
  };

  constructor(options: PlayerOptions = {}) {
    this.options = options;
    this.container = document.createElement("div");
    this.container.className = "player-dock-wrapper";
    this.render();
  }

  public getElement(): HTMLElement { return this.container; }

  public getState(): PlaybackState { return { ...this.state }; }

  public updateState(newState: Partial<PlaybackState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  private formatTime(seconds: number): string {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    return `${Math.floor(safe / 60)}:${Math.floor(safe % 60).toString().padStart(2, "0")}`;
  }

  private render(): void {
    const isPlaying = this.state.status === "playing";
    const track = this.state.currentTrack;
    const title = track?.title || "No track selected";
    const artist = track?.artist || "Choose a song to start listening";
    const duration = Math.max(0, this.state.durationSeconds || track?.durationSeconds || 0);
    const current = Math.min(Math.max(0, this.state.currentTimeSeconds), duration);
    const remaining = Math.max(0, duration - current);
    const progress = duration > 0 ? (current / duration) * 100 : 0;

    this.container.innerHTML = `
      <div class="player-blur-fade" aria-hidden="true"></div>
      <div class="mini-player">
        <div class="mini-player-left">
          <div class="player-artwork">
            <svg class="artwork-glyph" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#686461" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h4v5h6v-5h4" /></svg>
          </div>
          <div class="player-track-info">
            <span class="player-track-title">${escapeHtml(title)}</span>
            <span class="player-track-artist">${escapeHtml(artist)}</span>
          </div>
        </div>
        <div class="mini-player-center">
          <div class="player-controls-inline">
            <button class="btn-player-ctrl" id="btn-prev" title="Previous" aria-label="Previous" ${!track ? "disabled" : ""}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2.5"/></svg>
            </button>
            <button class="btn-player-ctrl btn-play-pause" id="btn-play-pause" title="${isPlaying ? "Pause" : "Play"}" aria-label="${isPlaying ? "Pause" : "Play"}" ${!track ? "disabled" : ""}>
              ${isPlaying
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>'}
            </button>
            <button class="btn-player-ctrl" id="btn-next" title="Next" aria-label="Next" ${!track ? "disabled" : ""}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.5"/></svg>
            </button>
          </div>
          <div class="player-slider-wrapper">
            <div class="player-slider-label">Playback progress</div>
            <div class="player-progress-bar" id="progress-bar" role="slider" tabindex="${track ? "0" : "-1"}"
                 aria-label="Playback position" aria-valuemin="0" aria-valuemax="${duration}" aria-valuenow="${current}">
              <div class="player-progress-fill" style="width: ${progress}%;"></div>
            </div>
            <div class="player-timestamps">
              <span class="player-time" id="time-current">${this.formatTime(current)}</span>
              <span class="player-time" id="time-remaining">-${this.formatTime(remaining)}</span>
            </div>
          </div>
        </div>
        <div class="mini-player-right">
          <button class="btn-player-icon" id="btn-queue" title="View Queue" aria-label="View Queue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h7M4 11h7M4 16h4M17 5v9.5a2 2 0 1 1-2-1.8l4-.7z"/></svg>
          </button>
          <button class="btn-player-icon" id="btn-add" title="Add to Playlist" aria-label="Add to Playlist" ${!track ? "disabled" : ""}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="btn-player-icon" id="btn-info" title="Track Info" aria-label="Track Info" ${!track ? "disabled" : ""}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button class="btn-player-icon" id="btn-now-playing" title="Now Playing Details" aria-label="Now Playing Details" ${!track ? "disabled" : ""}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="11" y1="6" x2="20" y2="6"/><line x1="11" y1="12" x2="20" y2="12"/><line x1="11" y1="18" x2="20" y2="18"/><polyline points="7 8 3 12 7 16"/></svg>
          </button>
        </div>
      </div>`;

    this.attachEvents();
  }

  private attachEvents(): void {
    this.container.querySelector("#btn-play-pause")?.addEventListener("click", () => this.options.onTogglePlayback?.());
    this.container.querySelector("#btn-prev")?.addEventListener("click", () => this.options.onPrevious?.());
    this.container.querySelector("#btn-next")?.addEventListener("click", () => this.options.onNext?.());
    this.container.querySelector("#btn-queue")?.addEventListener("click", () => this.options.onShowQueue?.());
    this.container.querySelector("#btn-add")?.addEventListener("click", () => this.options.onAddToPlaylist?.());
    this.container.querySelector("#btn-info")?.addEventListener("click", () => this.options.onShowTrackInfo?.());
    this.container.querySelector("#btn-now-playing")?.addEventListener("click", () => this.options.onShowTrackInfo?.());

    const progressBar = this.container.querySelector<HTMLElement>("#progress-bar");
    const seekFromPointer = (event: MouseEvent) => {
      if (!progressBar || !this.state.currentTrack || this.state.durationSeconds <= 0) return;
      const rect = progressBar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      this.options.onSeek?.(Math.floor(ratio * this.state.durationSeconds));
    };
    progressBar?.addEventListener("click", seekFromPointer);
    progressBar?.addEventListener("keydown", (event: KeyboardEvent) => {
      if (!this.state.currentTrack) return;
      const step = event.shiftKey ? 10 : 5;
      let next = this.state.currentTimeSeconds;
      if (event.key === "ArrowRight") next += step;
      else if (event.key === "ArrowLeft") next -= step;
      else return;
      event.preventDefault();
      this.options.onSeek?.(Math.max(0, Math.min(this.state.durationSeconds, next)));
    });
  }
}
