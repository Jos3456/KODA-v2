import { Genre } from "@/types/library";

export class GenresView {
  private container: HTMLElement;
  private genres: Genre[] = [];

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setGenres(genres: Genre[]): void {
    this.genres = genres;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Genres</h1>
      </div>
      <div class="card-grid">
        ${
          this.genres.length === 0
            ? `<div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--color-text-secondary);">No genres found</div>`
            : this.genres
                .map(
                  (genre) => `
          <div class="card" data-genre-id="${genre.id}">
            <div class="card-artwork" style="background-color: var(--color-surface-sage);">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#292522" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <div class="card-title">${genre.name}</div>
            <div class="card-subtitle">${genre.trackCount} tracks</div>
          </div>
        `
                )
                .join("")
        }
      </div>
    `;
  }
}
