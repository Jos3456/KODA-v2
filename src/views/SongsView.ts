import { TrackList } from "@/components/TrackList";
import { Track } from "@/types/library";

export class SongsView {
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

  public setTracks(tracks: Track[], selectedTrackId?: string): void {
    this.trackList.updateTracks(tracks, selectedTrackId);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Songs</h1>
        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search songs..." id="songs-search" />
        </div>
      </div>
      <div id="songs-list-container"></div>
    `;

    const listContainer = this.container.querySelector("#songs-list-container");
    if (listContainer) {
      listContainer.appendChild(this.trackList.getElement());
    }
  }
}
