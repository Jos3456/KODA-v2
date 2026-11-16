import { PlaybackState } from "@/types/playback";
import { router } from "@/app/router";

export class Player {
  private container: HTMLElement;
  private state: PlaybackState = {
    status: "playing",
    currentTrack: {
      id: "demo-1",
      filePath: "",
      title: "Whatever - Kygo, Ava Max",
      artist: "Sensitivity",
      album: "Sensitivity",
      durationSeconds: 252,
      hasArtwork: false,
      fileSizeBytes: 7000000,
      format: "mp3",
      dateAdded: "",
    },
    currentTimeSeconds: 107, // 1:47, remaining -2:25
    durationSeconds: 252,
    volume: 0.8,
    isMuted: false,
    isShuffle: false,
    repeatMode: "off",
  };

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "player-dock-wrapper";
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
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private render(): void {
    const isPlaying = this.state.status === "playing";
    const title = this.state.currentTrack?.title || "Whatever - Kygo, Ava Max";
    const subtitle = this.state.currentTrack?.artist || "Sensitivity";
    const duration = this.state.durationSeconds || 252;
    const current = Math.min(this.state.currentTimeSeconds, duration);
    const remaining = Math.max(0, duration - current);

    const currentTimeStr = this.formatTime(current);
    const remainingTimeStr = `-${this.formatTime(remaining)}`;
    const progressPercent = duration > 0 ? (current / duration) * 100 : 42;

    this.container.innerHTML = `
      <div class="player-blur-fade" aria-hidden="true"></div>
      <div class="mini-player">
        <div class="mini-player-left">
          <div class="player-artwork">
            <svg class="artwork-glyph" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#686461" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h4v5h6v-5h4" />
            </svg>
          </div>
          <div class="player-track-info">
            <span class="player-track-title">${title}</span>
            <span class="player-track-artist">${subtitle}</span>
          </div>
        </div>

        <div class="mini-player-center">
          <div class="player-controls-inline">
            <button class="btn-player-ctrl" id="btn-prev" title="Previous" aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20"/>
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2.5"/>
              </svg>
            </button>
            <button class="btn-player-ctrl btn-play-pause" id="btn-play-pause" title="${isPlaying ? "Pause" : "Play"}" aria-label="Play/Pause">
              ${
                isPlaying
                  ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
                  : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`
              }
            </button>
            <button class="btn-player-ctrl" id="btn-next" title="Next" aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.5"/>
              </svg>
            </button>
          </div>

          <div class="player-slider-wrapper">
            <div class="player-slider-label">Playback progress</div>
            <div class="player-progress-bar" id="progress-bar">
              <div class="player-progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="player-timestamps">
              <span class="player-time" id="time-current">${currentTimeStr}</span>
              <span class="player-time" id="time-remaining">${remainingTimeStr}</span>
            </div>
          </div>
        </div>

        <div class="mini-player-right">
          <!-- 1. Queue / Playlist icon (♪☰) -->
          <button class="btn-player-icon" id="btn-queue" title="View Queue" aria-label="View Queue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h7M4 11h7M4 16h4M17 5v9.5a2 2 0 1 1-2-1.8l4-.7z"/>
            </svg>
          </button>

          <!-- 2. Add button (+) -->
          <button class="btn-player-icon" id="btn-add" title="Add to Playlist" aria-label="Add to Playlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          <!-- 3. Question mark in circle (?) -->
          <button class="btn-player-icon" id="btn-info" title="Track Info" aria-label="Track Info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>

          <!-- 4. Side panel / view toggle (≡◀) -->
          <button class="btn-player-icon" id="btn-now-playing" title="Now Playing Details" aria-label="Now Playing Details">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="11" y1="6" x2="20" y2="6"/>
              <line x1="11" y1="12" x2="20" y2="12"/>
              <line x1="11" y1="18" x2="20" y2="18"/>
              <polyline points="7 8 3 12 7 16"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    // Play/Pause button
    this.container.querySelector("#btn-play-pause")?.addEventListener("click", () => {
      const nextStatus = this.state.status === "playing" ? "paused" : "playing";
      this.updateState({ status: nextStatus });
    });

    // Previous / Next buttons
    this.container.querySelector("#btn-prev")?.addEventListener("click", () => {
      this.updateState({ currentTimeSeconds: 0 });
    });

    this.container.querySelector("#btn-next")?.addEventListener("click", () => {
      this.updateState({ currentTimeSeconds: 0 });
    });

    // Click on progress bar to seek
    const progressBar = this.container.querySelector("#progress-bar") as HTMLElement;
    if (progressBar) {
      progressBar.addEventListener("click", (e: MouseEvent) => {
        const rect = progressBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const duration = this.state.durationSeconds || 252;
        this.updateState({ currentTimeSeconds: Math.floor(ratio * duration) });
      });
    }

    // Right-side icons
    this.container.querySelector("#btn-queue")?.addEventListener("click", () => {
      router.navigate("queue");
    });

    this.container.querySelector("#btn-now-playing")?.addEventListener("click", () => {
      router.navigate("now-playing");
    });
  }
}
