import { Playlist } from "@/types/playlists";

export class PlaylistsView {
  private container: HTMLElement;
  private playlists: Playlist[] = [];

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setPlaylists(playlists: Playlist[]): void {
    this.playlists = playlists;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Playlists</h1>
        <button class="btn btn-primary" id="btn-create-playlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Playlist</span>
        </button>
      </div>
      <div class="card-grid">
        ${
          this.playlists.length === 0
            ? `<div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--color-text-secondary);">No playlists created yet</div>`
            : this.playlists
                .map(
                  (pl) => `
          <div class="card" data-playlist-id="${pl.id}">
            <div class="card-artwork" style="background-color: var(--color-brand-peach-300);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#292522" stroke-width="1.5">
                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <div class="card-title">${pl.name}</div>
            <div class="card-subtitle">${pl.trackCount} tracks</div>
          </div>
        `
                )
                .join("")
        }
      </div>
    `;
  }
}
