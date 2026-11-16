import { router, RouteName } from "@/app/router";

export type ViewMode = "grid-large" | "grid-small" | "list";
export type SortField = "title" | "dateAdded" | "durationSeconds";
export interface SortOption { field: SortField; direction: "asc" | "desc"; }

const SORT_OPTIONS: SortOption[] = [
  { field: "title", direction: "asc" },
  { field: "title", direction: "desc" },
  { field: "dateAdded", direction: "asc" },
  { field: "dateAdded", direction: "desc" },
  { field: "durationSeconds", direction: "asc" },
  { field: "durationSeconds", direction: "desc" },
];

const SORT_LABELS: Record<SortField, string> = {
  title: "Name", dateAdded: "Date added", durationSeconds: "Duration",
};

export interface ToolbarOptions {
  onSearch?: (query: string) => void;
  onSort?: (sort: SortOption) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

export class Toolbar {
  private container: HTMLElement;
  private currentViewMode: ViewMode = "list";
  private options: ToolbarOptions;
  private trackCount = 0;
  private sortIndex = -1;

  constructor(options: ToolbarOptions = {}) {
    this.options = options;
    this.container = document.createElement("div");
    this.container.className = "app-toolbar";
    this.render();
    router.subscribe((route) => this.updateForRoute(route));
  }

  public getElement(): HTMLElement { return this.container; }

  public setTrackCount(count: number): void {
    this.trackCount = Math.max(0, count);
    const stats = this.container.querySelector<HTMLElement>(".toolbar-stats");
    if (stats) stats.textContent = `${this.trackCount} songs`;
  }

  public getViewMode(): ViewMode { return this.currentViewMode; }

  public setViewMode(mode: ViewMode): void {
    this.currentViewMode = mode;
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-view-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    });
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? "flex" : "none";
  }

  private updateForRoute(route: RouteName): void {
    const isLibraryView = ["songs", "artists", "albums", "genres", "playlists", "favourites", "queue"].includes(route);
    this.setVisible(isLibraryView);
    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-breadcrumb-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.target === route);
    });
    const search = this.container.querySelector<HTMLInputElement>(".toolbar-search-input");
    if (search) search.placeholder = route === "songs" ? "Search songs..." : `Search ${route.replace("-", " ")}...`;
  }

  private render(): void {
    const currentRoute = router.getRoute();
    this.container.innerHTML = `
      <div class="toolbar-left">
        <button class="toolbar-breadcrumb-item toolbar-stats ${currentRoute === "songs" ? "active" : ""}" data-target="songs">${this.trackCount} songs</button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item ${currentRoute === "artists" ? "active" : ""}" data-target="artists">Artists</button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item ${currentRoute === "albums" ? "active" : ""}" data-target="albums">Albums</button>
        <span class="toolbar-sep">/</span>
        <button class="toolbar-breadcrumb-item ${currentRoute === "playlists" ? "active" : ""}" data-target="playlists">Playlists</button>
      </div>
      <div class="toolbar-right">
        <div class="toolbar-search-wrapper">
          <input type="search" class="toolbar-search-input" placeholder="Search songs..." aria-label="Search library" />
          <span class="toolbar-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
        </div>
        <button class="toolbar-btn toolbar-sort-btn" title="Sort by name (ascending)" aria-label="Sort by name (ascending)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="4" x2="7" y2="20"/><polyline points="3 8 7 4 11 8"/>
            <line x1="17" y1="20" x2="17" y2="4"/><polyline points="13 16 17 20 21 16"/>
          </svg>
        </button>
        <div class="toolbar-view-group" role="group" aria-label="View mode">
          <button class="toolbar-btn toolbar-view-btn" data-mode="grid-large" title="Large Grid" aria-label="Large Grid" aria-pressed="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
          </button>
          <button class="toolbar-btn toolbar-view-btn" data-mode="grid-small" title="Small Grid" aria-label="Small Grid" aria-pressed="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/><rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/><rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/></svg>
          </button>
          <button class="toolbar-btn toolbar-view-btn active" data-mode="list" title="List View" aria-label="List View" aria-pressed="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="6" r="2"/><rect x="8.5" y="5" width="12.5" height="2" rx="1"/><circle cx="4" cy="12" r="2"/><rect x="8.5" y="11" width="12.5" height="2" rx="1"/><circle cx="4" cy="18" r="2"/><rect x="8.5" y="17" width="12.5" height="2" rx="1"/></svg>
          </button>
        </div>
      </div>`;

    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-breadcrumb-item").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target as RouteName | undefined;
        if (target) router.navigate(target);
      });
    });

    this.container.querySelector<HTMLInputElement>(".toolbar-search-input")?.addEventListener("input", (event) => {
      this.options.onSearch?.((event.currentTarget as HTMLInputElement).value.trim());
    });

    const sortButton = this.container.querySelector<HTMLButtonElement>(".toolbar-sort-btn");
    sortButton?.addEventListener("click", () => {
      this.sortIndex = (this.sortIndex + 1) % SORT_OPTIONS.length;
      const sort = SORT_OPTIONS[this.sortIndex];
      const label = `Sort by ${SORT_LABELS[sort.field].toLowerCase()} (${sort.direction === "asc" ? "ascending" : "descending"})`;
      sortButton.title = label;
      sortButton.setAttribute("aria-label", label);
      this.options.onSort?.(sort);
    });

    this.container.querySelectorAll<HTMLButtonElement>(".toolbar-view-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode as ViewMode | undefined;
        if (!mode) return;
        this.setViewMode(mode);
        this.options.onViewModeChange?.(mode);
      });
    });
    this.setViewMode(this.currentViewMode);
    this.updateForRoute(currentRoute);
  }
}
