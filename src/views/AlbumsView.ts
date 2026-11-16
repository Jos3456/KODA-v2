import { ViewMode } from "@/components/Toolbar";
import { Album } from "@/types/library";

export class AlbumsView {
  private container: HTMLElement;
  private albums: Album[] = [];
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

  public setAlbums(albums: Album[]): void {
    this.albums = albums;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="card-grid ${this.currentViewMode}">
        ${
          this.albums.length === 0
            ? `<div class="empty-state" style="grid-column: 1 / -1;">
                <p class="empty-state-title">No albums discovered yet</p>
                <p class="empty-state-subtitle">Select a music folder in settings to scan your collection.</p>
              </div>`
            : this.albums
                .map(
                  (album) => `
          <div class="card" data-album-id="${album.id}">
            <div class="card-artwork">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div class="card-title">${album.title}</div>
            <div class="card-subtitle">${album.artist} • ${album.trackCount} tracks</div>
          </div>
        `
                )
                .join("")
        }
      </div>
    `;
  }
}
