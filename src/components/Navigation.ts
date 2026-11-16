import { router, RouteName } from "@/app/router";

interface NavItemConfig { id: RouteName; label: string; iconSvg: string; }

export class Navigation {
  private container: HTMLElement;
  private items: NavItemConfig[] = [
    { id: "songs", label: "Songs", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>' },
    { id: "artists", label: "Artists", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' },
    { id: "albums", label: "Albums", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>' },
    { id: "genres", label: "Genres", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' },
    { id: "playlists", label: "Playlists", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16M4 12h16M4 18h10"/></svg>' },
    { id: "favourites", label: "Favourites", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35z"/></svg>' },
    { id: "settings", label: "Settings", iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L3.54 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/></svg>' },
  ];

  constructor() {
    this.container = document.createElement("nav");
    this.container.className = "app-topbar";
    this.render();
    router.subscribe((route) => this.updateActiveItem(route));
  }

  public getElement(): HTMLElement { return this.container; }

  private render(): void {
    const currentRoute = router.getRoute();
    this.container.innerHTML = `<div class="topbar-nav">${this.items.map((item) => `
      <button class="topbar-nav-item ${item.id === currentRoute ? "active" : ""}" data-route="${item.id}" aria-current="${item.id === currentRoute ? "page" : "false"}">
        ${item.iconSvg}<span>${item.label}</span>
      </button>`).join("")}</div>`;

    this.container.querySelectorAll<HTMLButtonElement>(".topbar-nav-item").forEach((button) => {
      button.addEventListener("mousemove", (event: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        button.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
      });
      button.addEventListener("mouseleave", () => {
        button.style.removeProperty("--mouse-x");
        button.style.removeProperty("--mouse-y");
      });
      button.addEventListener("click", () => {
        const route = button.dataset.route as RouteName | undefined;
        if (route) router.navigate(route);
      });
    });
  }

  private updateActiveItem(activeRoute: RouteName): void {
    this.container.querySelectorAll<HTMLButtonElement>(".topbar-nav-item").forEach((button) => {
      const active = button.dataset.route === activeRoute;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
  }
}
