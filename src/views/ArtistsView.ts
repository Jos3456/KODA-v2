import { ViewMode } from "@/components/Toolbar";
import { Artist } from "@/types/library";

export class ArtistsView {
  private container: HTMLElement;
  private artists: Artist[] = [];
  private currentViewMode: ViewMode = "grid-large";

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setViewMode(mode: ViewMode): void {
    this.currentViewMode = mode;
    const grid = this.container.querySelector(".card-grid");
    if (grid) {
      grid.className = `card-grid ${mode}`;
    }
  }

  public setArtists(artists: Artist[]): void {
    this.artists = artists;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="card-grid ${this.currentViewMode}">
        ${
          this.artists.length === 0
            ? `<div class="empty-state" style="grid-column: 1 / -1;">
                <p class="empty-state-title">No artists discovered yet</p>
                <p class="empty-state-subtitle">Select a music folder in settings to scan your collection.</p>
              </div>`
            : this.artists
                .map(
                  (artist) => `
          <div class="card" data-artist-id="${artist.id}">
            <div class="card-artwork" style="border-radius: var(--radius-pill);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="card-title" style="text-align: center;">${artist.name}</div>
            <div class="card-subtitle" style="text-align: center;">${artist.albumCount} albums • ${artist.trackCount} tracks</div>
          </div>
        `
                )
                .join("")
        }
      </div>
    `;
  }
}
