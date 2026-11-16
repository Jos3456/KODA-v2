import { Track } from "@/types/library";

export interface TrackListOptions {
  tracks: Track[];
  selectedTrackId?: string;
  onTrackSelect?: (track: Track) => void;
  onToggleFavourite?: (trackId: string) => void;
}

export class TrackList {
  private container: HTMLElement;
  private options: TrackListOptions;

  constructor(options: TrackListOptions) {
    this.options = options;
    this.container = document.createElement("div");
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
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
    if (this.options.tracks.length === 0) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 48px; color: var(--color-text-secondary);">
          <p style="font-size: var(--font-size-lg); margin-bottom: 8px;">No songs found</p>
          <p style="font-size: var(--font-size-sm);">Select a music folder in settings to scan your collection.</p>
        </div>
      `;
      return;
    }

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
          ${this.options.tracks
            .map(
              (track, index) => `
            <tr class="track-row ${track.id === this.options.selectedTrackId ? "selected" : ""}" data-track-id="${track.id}">
              <td>${track.trackNumber || index + 1}</td>
              <td style="font-weight: 600;">${track.title}</td>
              <td>${track.artist}</td>
              <td>${track.album}</td>
              <td style="text-align: right;">${this.formatDuration(track.durationSeconds)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    this.container.querySelectorAll<HTMLTableRowElement>(".track-row").forEach((row) => {
      row.addEventListener("click", () => {
        const trackId = row.dataset.trackId;
        const track = this.options.tracks.find((t) => t.id === trackId);
        if (track && this.options.onTrackSelect) {
          this.options.onTrackSelect(track);
        }
      });
    });
  }
}
