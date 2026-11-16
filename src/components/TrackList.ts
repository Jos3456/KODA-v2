import { Track } from "@/types/library";
import { ViewMode } from "./Toolbar";

export interface TrackListOptions {
  tracks: Track[];
  selectedTrackId?: string;
  viewMode?: ViewMode;
  onTrackSelect?: (track: Track) => void;
  onToggleFavourite?: (trackId: string) => void;
}

const DEMO_TRACKS: Track[] = [
  { id: "demo-1", filePath: "", title: "Whatever", artist: "Kygo, Ava Max", album: "Sensitivity", durationSeconds: 177, hasArtwork: false, fileSizeBytes: 7000000, format: "mp3", dateAdded: "" },
  { id: "demo-2", filePath: "", title: "Sensitivity", artist: "Kygo", album: "Sensitivity", durationSeconds: 215, hasArtwork: false, fileSizeBytes: 8000000, format: "mp3", dateAdded: "" },
  { id: "demo-3", filePath: "", title: "Stargazing", artist: "Kygo, Justin Jesso", album: "Stargazing", durationSeconds: 236, hasArtwork: false, fileSizeBytes: 9000000, format: "mp3", dateAdded: "" },
  { id: "demo-4", filePath: "", title: "Firestone", artist: "Kygo, Conrad Sewell", album: "Cloud Nine", durationSeconds: 273, hasArtwork: false, fileSizeBytes: 10000000, format: "mp3", dateAdded: "" },
  { id: "demo-5", filePath: "", title: "Higher Ground", artist: "Martin Garrix, John Martin", album: "Higher Ground", durationSeconds: 206, hasArtwork: false, fileSizeBytes: 8000000, format: "mp3", dateAdded: "" },
  { id: "demo-6", filePath: "", title: "Freeze", artist: "Kygo", album: "Thrill Of The Chase", durationSeconds: 493, hasArtwork: false, fileSizeBytes: 19000000, format: "mp3", dateAdded: "" },
  { id: "demo-7", filePath: "", title: "Sunrise", artist: "Kygo, Jason Walker", album: "Kids in Love", durationSeconds: 214, hasArtwork: false, fileSizeBytes: 8000000, format: "mp3", dateAdded: "" },
  { id: "demo-8", filePath: "", title: "Permanent", artist: "Kygo, JHart", album: "Kids in Love", durationSeconds: 228, hasArtwork: false, fileSizeBytes: 8500000, format: "mp3", dateAdded: "" },
  { id: "demo-9", filePath: "", title: "Remind Me to Forget", artist: "Kygo, Miguel", album: "Kids in Love", durationSeconds: 217, hasArtwork: false, fileSizeBytes: 8200000, format: "mp3", dateAdded: "" },
  { id: "demo-10", filePath: "", title: "Raging", artist: "Kygo, Kodaline", album: "Cloud Nine", durationSeconds: 224, hasArtwork: false, fileSizeBytes: 8600000, format: "mp3", dateAdded: "" },
  { id: "demo-11", filePath: "", title: "Born to Be Yours", artist: "Kygo, Imagine Dragons", album: "Born to Be Yours", durationSeconds: 193, hasArtwork: false, fileSizeBytes: 7500000, format: "mp3", dateAdded: "" },
  { id: "demo-12", filePath: "", title: "Lose Somebody", artist: "Kygo, OneRepublic", album: "Golden Hour", durationSeconds: 199, hasArtwork: false, fileSizeBytes: 7800000, format: "mp3", dateAdded: "" },
];

export class TrackList {
  private container: HTMLElement;
  private options: TrackListOptions;
  private currentViewMode: ViewMode = "list";

  constructor(options: TrackListOptions) {
    this.options = options;
    if (options.viewMode) {
      this.currentViewMode = options.viewMode;
    }
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
    if (selectedTrackId !== undefined) {
      this.options.selectedTrackId = selectedTrackId;
    }
    this.render();
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private render(): void {
    const tracks = this.options.tracks.length > 0 ? this.options.tracks : DEMO_TRACKS;

    if (this.currentViewMode === "list") {
      this.renderListView(tracks);
    } else {
      this.renderGridView(tracks, this.currentViewMode);
    }

    this.attachEventListeners(tracks);
  }

  private renderListView(tracks: Track[]): void {
    this.container.innerHTML = `
      <table class="track-table">
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th style="width: 70px; text-align: right;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${tracks
            .map(
              (track, index) => `
            <tr class="track-row ${track.id === this.options.selectedTrackId ? "selected" : ""}" data-track-id="${track.id}">
              <td class="track-number">${track.trackNumber || index + 1}</td>
              <td class="track-title">${track.title}</td>
              <td class="track-artist">${track.artist}</td>
              <td class="track-album">${track.album}</td>
              <td class="track-time" style="text-align: right;">${this.formatDuration(track.durationSeconds)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  private renderGridView(tracks: Track[], mode: "grid-large" | "grid-small"): void {
    const glyphSize = mode === "grid-large" ? 48 : 28;
    const strokeWidth = mode === "grid-large" ? 2.8 : 2.5;

    this.container.innerHTML = `
      <div class="card-grid ${mode}">
        ${tracks
          .map(
            (track) => `
          <div class="card song-card ${track.id === this.options.selectedTrackId ? "selected" : ""}" data-track-id="${track.id}" title="${track.title} • ${track.artist}">
            <div class="card-artwork song-artwork">
              <svg class="artwork-glyph" width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" stroke="#686461" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h4v5h6v-5h4" />
              </svg>
            </div>
            <div class="card-title">${track.title}</div>
            <div class="card-subtitle">${track.artist}</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  private attachEventListeners(tracks: Track[]): void {
    this.container.querySelectorAll<HTMLElement>(".track-row, .song-card").forEach((el) => {
      el.addEventListener("click", () => {
        const trackId = el.dataset.trackId;
        const track = tracks.find((t) => t.id === trackId);
        if (track) {
          this.options.selectedTrackId = track.id;
          this.container.querySelectorAll(".track-row, .song-card").forEach((item) => {
            item.classList.toggle("selected", (item as HTMLElement).dataset.trackId === track.id);
          });
          if (this.options.onTrackSelect) {
            this.options.onTrackSelect(track);
          }
        }
      });
    });
  }
}
