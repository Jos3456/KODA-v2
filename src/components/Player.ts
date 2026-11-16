import { PlaybackState } from "@/types/playback";
import { router } from "@/app/router";

export class Player {
  private container: HTMLElement;
  private state: PlaybackState = {
    status: "stopped",
    currentTimeSeconds: 0,
    durationSeconds: 0,
    volume: 0.8,
    isMuted: false,
    isShuffle: false,
    repeatMode: "off",
  };

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "mini-player";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public updateState(newState: Partial<PlaybackState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private render(): void {
    const isPlaying = this.state.status === "playing";
    const title = this.state.currentTrack?.title || "No track selected";
    const artist = this.state.currentTrack?.artist || "Choose music to play";
    const currentTimeStr = this.formatTime(this.state.currentTimeSeconds);
    const durationStr = this.formatTime(this.state.durationSeconds);
    const progressPercent = this.state.durationSeconds > 0
      ? (this.state.currentTimeSeconds / this.state.durationSeconds) * 100
      : 0;

    this.container.innerHTML = `
      <div class="mini-player-left">
        <div class="player-artwork">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div class="player-track-info">
          <span class="player-track-title">${title}</span>
          <span class="player-track-artist">${artist}</span>
        </div>
      </div>

      <div class="mini-player-center">
        <div class="player-controls">
          <button class="btn-icon" id="btn-shuffle" title="Shuffle" style="${this.state.isShuffle ? "opacity:1" : "opacity:0.6"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>
          <button class="btn-icon" id="btn-prev" title="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"></line>
            </svg>
          </button>
          <button class="player-play-pause-btn" id="btn-play-pause" title="${isPlaying ? "Pause" : "Play"}">
            ${
              isPlaying
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
            }
          </button>
          <button class="btn-icon" id="btn-next" title="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"></line>
            </svg>
          </button>
          <button class="btn-icon" id="btn-repeat" title="Repeat: ${this.state.repeatMode}" style="${this.state.repeatMode !== "off" ? "opacity:1" : "opacity:0.6"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </button>
        </div>

        <div class="player-progress-container">
          <span class="player-time" id="time-current">${currentTimeStr}</span>
          <div class="player-progress-bar" id="progress-bar">
            <div class="player-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <span class="player-time" id="time-duration">${durationStr}</span>
        </div>
      </div>

      <div class="mini-player-right">
        <button class="btn-icon" id="btn-queue" title="View Queue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button class="btn-icon" id="btn-now-playing" title="Now Playing View">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </button>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    this.container.querySelector("#btn-queue")?.addEventListener("click", () => {
      router.navigate("queue");
    });
    this.container.querySelector("#btn-now-playing")?.addEventListener("click", () => {
      router.navigate("now-playing");
    });
  }
}
