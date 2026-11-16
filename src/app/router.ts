export type RouteName =
  | "songs"
  | "albums"
  | "artists"
  | "genres"
  | "playlists"
  | "favourites"
  | "settings"
  | "queue"
  | "now-playing";

export type RouteListener = (route: RouteName, params?: Record<string, string>) => void;

export class Router {
  private currentRoute: RouteName = "songs";
  private params: Record<string, string> = {};
  private listeners: RouteListener[] = [];

  constructor() {
    // Listen to hash changes if used
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "") as RouteName;
      if (hash) {
        this.navigate(hash);
      }
    });
  }

  public getRoute(): RouteName {
    return this.currentRoute;
  }

  public getParams(): Record<string, string> {
    return this.params;
  }

  public navigate(route: RouteName, params: Record<string, string> = {}): void {
    this.currentRoute = route;
    this.params = params;
    window.location.hash = route;
    for (const listener of this.listeners) {
      listener(route, params);
    }
  }

  public subscribe(listener: RouteListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const router = new Router();
