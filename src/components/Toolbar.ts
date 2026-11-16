import { router, RouteName } from "@/app/router";

export type ViewMode = "grid-large" | "grid-small" | "list";

export interface ToolbarOptions {
  onSearch?: (query: string) => void;
  onSort?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

export class Toolbar {
  private container: HTMLElement;
  private currentViewMode: ViewMode = "list";
  private options: ToolbarOptions;
  private trackCount: number = 84;

  constructor(options: ToolbarOptions = {}) {
    this.options = options;
    this.container = document.createElement("div");
    this.container.className = "app-toolbar";
    this.render();

    router.subscribe((route) => {
      this.updateForRoute(route);
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setTrackCount(count: number): void {
    this.trackCount = count;
    const statsEl = this.container.querySelector<HTMLElement>(".toolbar-stats");
    if (statsEl) {
      statsEl.textContent = `${count} songs`;
    }
  }

  public getViewMode(): ViewMode {
    return this.currentViewMode;
  }

  public setViewMode(mode: ViewMode): void {
    this.currentViewMode = mode;
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? "flex" : "none";
  }

  private updateForRoute(route: RouteName): void {
    // Hide search toolbar on settings and now-playing views
    const isLibraryView = ["songs", "artists", "albums", "genres", "playlists", "favourites", "queue"].includes(route);
    this.setVisible(isLibraryView);

    // Update active highlight on breadcrumb links
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-nav-link, .toolbar-stats").forEach((btn) => {
      const target = btn.dataset.target as RouteName;
      btn.classList.toggle("active", target === route);
    });
  }

  private render(): void {
    const currentRoute = router.getRoute();

    this.container.innerHTML = `
      <div class="toolbar-left">
        <button class="toolbar-breadcrumb-item toolbar-stats ${currentRoute === "songs" ? "active" : ""}" data-target="songs">
          ${this.trackCount} songs
        </button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item toolbar-nav-link ${currentRoute === "artists" ? "active" : ""}" data-target="artists">
          Artists
        </button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item toolbar-nav-link ${currentRoute === "albums" ? "active" : ""}" data-target="albums">
          Albums
        </button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item toolbar-nav-link ${currentRoute === "playlists" ? "active" : ""}" data-target="playlists">
          Playlists
        </button>
      </div>

      <div class="toolbar-right">
        <div class="toolbar-search-wrapper">
          <input 
            type="text" 
            class="toolbar-search-input" 
            placeholder="Search........" 
            aria-label="Search"
          />
          <span class="toolbar-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
        </div>

        <button class="toolbar-btn toolbar-sort-btn" title="Sort" aria-label="Sort">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="4" x2="7" y2="20"/>
            <polyline points="3 8 7 4 11 8"/>
            <line x1="17" y1="20" x2="17" y2="4"/>
            <polyline points="13 16 17 20 21 16"/>
          </svg>
        </button>

        <div class="toolbar-view-group" role="group" aria-label="View mode">
          <button 
            class="toolbar-btn toolbar-view-btn ${this.currentViewMode === "grid-large" ? "active" : ""}" 
            data-mode="grid-large" 
            title="Large Grid" 
            aria-label="Large Grid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="1.5"/>
              <rect x="13" y="3" width="8" height="8" rx="1.5"/>
              <rect x="3" y="13" width="8" height="8" rx="1.5"/>
              <rect x="13" y="13" width="8" height="8" rx="1.5"/>
            </svg>
          </button>
          <button 
            class="toolbar-btn toolbar-view-btn ${this.currentViewMode === "grid-small" ? "active" : ""}" 
            data-mode="grid-small" 
            title="Small Grid" 
            aria-label="Small Grid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="4.5" height="4.5" rx="1"/>
              <rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/>
              <rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/>
              <rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/>
              <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/>
              <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/>
              <rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/>
              <rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/>
              <rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/>
            </svg>
          </button>
          <button 
            class="toolbar-btn toolbar-view-btn ${this.currentViewMode === "list" ? "active" : ""}" 
            data-mode="list" 
            title="List View" 
            aria-label="List View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="4" cy="6" r="2"/>
              <rect x="8.5" y="5" width="12.5" height="2" rx="1"/>
              <circle cx="4" cy="12" r="2"/>
              <rect x="8.5" y="11" width="12.5" height="2" rx="1"/>
              <circle cx="4" cy="18" r="2"/>
              <rect x="8.5" y="17" width="12.5" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Breadcrumb navigation clicks
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-breadcrumb-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target as RouteName;
        if (target) {
          router.navigate(target);
        }
      });
    });

    // Search input
    const searchInput = this.container.querySelector<HTMLInputElement>(".toolbar-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        if (this.options.onSearch) {
          this.options.onSearch(searchInput.value.trim());
        }
      });
    }

    // Sort button
    const sortBtn = this.container.querySelector<HTMLButtonElement>(".toolbar-sort-btn");
    if (sortBtn) {
      sortBtn.addEventListener("click", () => {
        if (this.options.onSort) {
          this.options.onSort();
        }
      });
    }

    // View mode buttons
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode as ViewMode;
        if (mode) {
          this.setViewMode(mode);
          if (this.options.onViewModeChange) {
            this.options.onViewModeChange(mode);
          }
        }
      });
    });
  }
}
