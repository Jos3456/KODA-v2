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
      label: "Song",
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    },
    {
      id: "artists",
      label: "Artist",
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    },
    {
      id: "albums",
      label: "Album",
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
    },
    {
      id: "playlists",
      label: "Playlist",
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/></svg>`,
    },
    {
      id: "settings",
      label: "Settings",
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    },
  ];

  constructor() {
    this.container = document.createElement("nav");
    this.container.className = "app-topbar";
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
      <div class="topbar-nav">
        ${this.items
          .map(
            (item) => `
          <button class="topbar-nav-item ${item.id === currentRoute ? "active" : ""}" data-route="${item.id}">
            ${item.iconSvg}
            <span>${item.label}</span>
          </button>
        `
          )
          .join("")}
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>(".topbar-nav-item").forEach((btn) => {
      btn.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty("--mouse-x", `${x}px`);
        btn.style.setProperty("--mouse-y", `${y}px`);
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.removeProperty("--mouse-x");
        btn.style.removeProperty("--mouse-y");
      });

      btn.addEventListener("click", () => {
        const route = btn.dataset.route as RouteName;
        if (route) {
          router.navigate(route);
        }
      });
    });
  }

  private updateActiveItem(activeRoute: RouteName): void {
    this.container.querySelectorAll<HTMLButtonElement>(".topbar-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === activeRoute);
    });
  }
}
