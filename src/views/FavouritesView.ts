import { TrackList } from "@/components/TrackList";
import { ViewMode } from "@/components/Toolbar";
import { Track } from "@/types/library";

export class FavouritesView {
  private container: HTMLElement;
  private trackList: TrackList;

  constructor(onTrackSelect?: (track: Track) => void) {
    this.container = document.createElement("div");
    this.container.className = "app-content";

    this.trackList = new TrackList({
      tracks: [],
      onTrackSelect,
    });

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setViewMode(mode: ViewMode): void {
    this.trackList.setViewMode(mode);
  }

  public setTracks(tracks: Track[], selectedTrackId?: string): void {
    this.trackList.updateTracks(tracks, selectedTrackId);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Favourites</h1>
      </div>
      <div id="favourites-list-container"></div>
    `;

    const listContainer = this.container.querySelector("#favourites-list-container");
    if (listContainer) {
      listContainer.appendChild(this.trackList.getElement());
    }
  }
}
