import { Artist } from "@/types/library";

export class ArtistsView {
  private container: HTMLElement;
  private artists: Artist[] = [];

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setArtists(artists: Artist[]): void {
    this.artists = artists;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Artists</h1>
        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search artists..." />
        </div>
      </div>
      <div class="card-grid">
        ${
          this.artists.length === 0
            ? `<div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--color-text-secondary);">No artists discovered yet</div>`
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
