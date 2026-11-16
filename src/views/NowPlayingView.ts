import { Track } from "@/types/library";

export class NowPlayingView {
  private container: HTMLElement;
  private currentTrack?: Track;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "app-content";
    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setTrack(track?: Track): void {
    this.currentTrack = track;
    this.render();
  }

  private render(): void {
    const title = this.currentTrack?.title || "No track currently playing";
    const artist = this.currentTrack?.artist || "Choose a song to start listening";
    const album = this.currentTrack?.album || "";

    this.container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-xl); text-align: center;">
        <div style="width: 320px; height: 320px; border-radius: var(--radius-lg); background-color: var(--color-surface-artwork-placeholder); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>

        <div>
          <h1 style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--theme-text-header); margin-bottom: var(--space-2xs);">${title}</h1>
          <p style="font-size: var(--font-size-xl); color: var(--color-text-muted-on-gradient); margin-bottom: var(--space-xs);">${artist}</p>
          ${album ? `<p style="font-size: var(--font-size-sm); color: var(--color-text-muted-on-gradient); opacity: 0.8;">${album}</p>` : ""}
        </div>
      </div>
    `;
  }
}
