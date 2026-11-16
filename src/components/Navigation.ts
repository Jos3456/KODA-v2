import { router, RouteName } from "@/app/router";

interface NavItemConfig {
  id: RouteName;
  label: string;
  iconSvg: string;
}

export class Navigation {
  private container: HTMLElement;

  private items: NavItemConfig[] = [
    {
      id: "songs",
      label: "Songs",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    },
    {
      id: "albums",
      label: "Albums",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle></svg>`,
    },
    {
      id: "artists",
      label: "Artists",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    },
    {
      id: "genres",
      label: "Genres",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    },
    {
      id: "favourites",
      label: "Favourites",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    },
    {
      id: "playlists",
      label: "Playlists",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    },
    {
      id: "settings",
      label: "Settings",
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    },
  ];

  constructor() {
    this.container = document.createElement("aside");
    this.container.className = "app-sidebar";
    this.render();

    router.subscribe((route) => {
      this.updateActiveItem(route);
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  private render(): void {
    const currentRoute = router.getRoute();

    this.container.innerHTML = `
      <div class="brand-header">
        <svg class="brand-logo-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span class="brand-title">Koda</span>
      </div>
      <nav class="nav-group">
        ${this.items
          .map(
            (item) => `
          <button class="nav-item ${item.id === currentRoute ? "active" : ""}" data-route="${item.id}">
            ${item.iconSvg}
            <span>${item.label}</span>
          </button>
        `
          )
          .join("")}
      </nav>
    `;

    this.container.querySelectorAll<HTMLButtonElement>(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const route = btn.dataset.route as RouteName;
        if (route) {
          router.navigate(route);
        }
      });
    });
  }

  private updateActiveItem(activeRoute: RouteName): void {
    this.container.querySelectorAll<HTMLButtonElement>(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === activeRoute);
    });
  }
}
