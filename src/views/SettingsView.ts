import { AppSettings } from "@/types/settings";

export interface SettingsViewEvents {
  onSelectFolder: () => void;
  onStartScan: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export class SettingsView {
  private container: HTMLElement;
  private settings: AppSettings = {
    version: 1,
    theme: "light",
    dynamicColorEnabled: false,
    volume: 0.8,
    visibleViews: {
      songs: true,
      albums: true,
      artists: true,
      genres: true,
      playlists: true,
      favourites: true,
    },
    preferHardwareAcceleration: true,
  };
  private events?: SettingsViewEvents;

  constructor(events?: SettingsViewEvents) {
    this.events = events;
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public updateSettings(newSettings: AppSettings): void {
    this.settings = newSettings;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Settings</h1>
      </div>

      <div style="max-width: 640px; display: flex; flex-direction: column; gap: var(--space-lg);">
        <!-- Music Library Section -->
        <div style="background: var(--color-surface-cream); padding: var(--space-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h2 style="font-size: var(--font-size-lg); margin-bottom: var(--space-sm); color: var(--color-brand-brown-900);">Music Library</h2>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-md);">
            Select a folder containing your local audio files. Koda will recursively scan and index your music collection.
          </p>
          <div style="display: flex; gap: var(--space-sm); align-items: center; margin-bottom: var(--space-md);">
            <input type="text" readonly value="${this.settings.musicFolder || "No folder selected"}" 
              style="flex: 1; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.15); background: #fff;" />
            <button class="btn btn-primary" id="btn-browse-folder">Browse...</button>
          </div>
          <button class="btn btn-secondary" id="btn-rescan-folder" ${!this.settings.musicFolder ? "disabled style='opacity:0.5; cursor:not-allowed;'" : ""}>
            Scan Library Now
          </button>
        </div>

        <!-- Appearance Section -->
        <div style="background: var(--color-surface-cream); padding: var(--space-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h2 style="font-size: var(--font-size-lg); margin-bottom: var(--space-sm); color: var(--color-brand-brown-900);">Appearance</h2>
          
          <div style="margin-bottom: var(--space-md);">
            <label style="display: block; font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-xs);">Theme</label>
            <select id="select-theme" style="padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); border: 1px solid rgba(0,0,0,0.15); width: 200px;">
              <option value="light" ${this.settings.theme === "light" ? "selected" : ""}>Light (Warm Palette)</option>
              <option value="dark" ${this.settings.theme === "dark" ? "selected" : ""}>Dark</option>
              <option value="dynamic" ${this.settings.theme === "dynamic" ? "selected" : ""}>Dynamic (from Artwork)</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <input type="checkbox" id="chk-dynamic-color" ${this.settings.dynamicColorEnabled ? "checked" : ""} />
            <label for="chk-dynamic-color" style="font-size: var(--font-size-sm); cursor: pointer;">Derive accent colors from currently playing album artwork</label>
          </div>
        </div>

        <!-- About Koda -->
        <div style="background: var(--color-surface-cream); padding: var(--space-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h2 style="font-size: var(--font-size-lg); margin-bottom: var(--space-xs); color: var(--color-brand-brown-900);">About Koda</h2>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-xs);">
            Koda v0.1.0 — A modern, minimal, offline-first desktop music player.
          </p>
          <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
            Powered by Tauri 2, Rust, and Vite.
          </p>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-browse-folder")?.addEventListener("click", () => {
      this.events?.onSelectFolder();
    });

    this.container.querySelector("#btn-rescan-folder")?.addEventListener("click", () => {
      this.events?.onStartScan();
    });

    this.container.querySelector("#select-theme")?.addEventListener("change", (e) => {
      const theme = (e.target as HTMLSelectElement).value as AppSettings["theme"];
      this.events?.onUpdateSettings({ theme });
    });

    this.container.querySelector("#chk-dynamic-color")?.addEventListener("change", (e) => {
      const dynamicColorEnabled = (e.target as HTMLInputElement).checked;
      this.events?.onUpdateSettings({ dynamicColorEnabled });
    });
  }
}
