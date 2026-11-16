import { Track } from "@/types/library";
import { ViewMode } from "./Toolbar";

export interface TrackListOptions {
  tracks: Track[];
  selectedTrackId?: string;
  viewMode?: ViewMode;
  onTrackSelect?: (track: Track) => void;
  onToggleFavourite?: (trackId: string) => void;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] as string);

export class TrackList {
  private container: HTMLElement;
  private options: TrackListOptions;
  private currentViewMode: ViewMode = "list";

  constructor(options: TrackListOptions) {
    this.options = options;
    this.currentViewMode = options.viewMode ?? "list";
    this.container = document.createElement("div");
    this.container.className = "tracklist-container";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setViewMode(mode: ViewMode): void {
    if (this.currentViewMode !== mode) {
      this.currentViewMode = mode;
      this.render();
    }
  }

  public updateTracks(tracks: Track[], selectedTrackId?: string): void {
    this.options.tracks = tracks;
    if (selectedTrackId !== undefined) this.options.selectedTrackId = selectedTrackId;
    this.render();
  }

  private formatDuration(seconds: number): string {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    return `${Math.floor(safeSeconds / 60)}:${Math.floor(safeSeconds % 60).toString().padStart(2, "0")}`;
  }

  private render(): void {
    const tracks = this.options.tracks;

    if (tracks.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">No songs found</p>
          <p class="empty-state-subtitle">Add a music folder in Settings and scan your library, or try a different search.</p>
        </div>`;
      return;
    }

    if (this.currentViewMode === "list") this.renderListView(tracks);
    else this.renderGridView(tracks, this.currentViewMode);

    this.attachEventListeners(tracks);
  }

  private renderListView(tracks: Track[]): void {
    this.container.innerHTML = `
      <table class="track-table">
        <thead><tr>
          <th style="width: 40px;">#</th><th>Title</th><th>Artist</th><th>Album</th>
          <th style="width: 70px; text-align: right;">Time</th>
        </tr></thead>
        <tbody>${tracks.map((track, index) => `
          <tr class="track-row ${track.id === this.options.selectedTrackId ? "selected" : ""}" data-track-id="${escapeHtml(track.id)}">
            <td class="track-number">${track.trackNumber || index + 1}</td>
            <td class="track-title">${escapeHtml(track.title)}</td>
            <td class="track-artist">${escapeHtml(track.artist)}</td>
            <td class="track-album">${escapeHtml(track.album)}</td>
            <td class="track-time" style="text-align: right;">${this.formatDuration(track.durationSeconds)}</td>
          </tr>`).join("")}</tbody>
      </table>`;
  }

  private renderGridView(tracks: Track[], mode: "grid-large" | "grid-small"): void {
    const glyphSize = mode === "grid-large" ? 48 : 28;
    const strokeWidth = mode === "grid-large" ? 2.8 : 2.5;

    this.container.innerHTML = `
      <div class="card-grid ${mode}">
        ${tracks.map((track) => `
          <div class="card song-card ${track.id === this.options.selectedTrackId ? "selected" : ""}"
               data-track-id="${escapeHtml(track.id)}"
               title="${escapeHtml(`${track.title} • ${track.artist}`)}">
            <div class="card-artwork song-artwork">
              <svg class="artwork-glyph" width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24"
                   fill="none" stroke="#686461" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h4v5h6v-5h4" />
              </svg>
            </div>
            <div class="card-title">${escapeHtml(track.title)}</div>
            <div class="card-subtitle">${escapeHtml(track.artist)}</div>
          </div>`).join("")}
      </div>`;
  }

  private attachEventListeners(tracks: Track[]): void {
    this.container.querySelectorAll<HTMLElement>(".track-row, .song-card").forEach((element) => {
      element.addEventListener("click", () => {
        const track = tracks.find((item) => item.id === element.dataset.trackId);
        if (!track) return;

        this.options.selectedTrackId = track.id;
        this.container.querySelectorAll<HTMLElement>(".track-row, .song-card").forEach((item) => {
          item.classList.toggle("selected", item.dataset.trackId === track.id);
        });
        this.options.onTrackSelect?.(track);
      });
    });
  }
}
