import { Album } from "@/types/library";

export class AlbumsView {
  private container: HTMLElement;
  private albums: Album[] = [];

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setAlbums(albums: Album[]): void {
    this.albums = albums;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Albums</h1>
        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search albums..." />
        </div>
      </div>
      <div class="card-grid">
        ${
          this.albums.length === 0
            ? `<div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--color-text-secondary);">No albums discovered yet</div>`
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
