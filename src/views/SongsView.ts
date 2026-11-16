import { TrackList } from "@/components/TrackList";
import { ViewMode } from "@/components/Toolbar";
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

  public setViewMode(mode: ViewMode): void {
    this.trackList.setViewMode(mode);
  }

  public setTracks(tracks: Track[], selectedTrackId?: string): void {
    this.trackList.updateTracks(tracks, selectedTrackId);
  }

  private render(): void {
    this.container.innerHTML = `
      <div id="songs-list-container"></div>
    `;

    const listContainer = this.container.querySelector("#songs-list-container");
    if (listContainer) {
      listContainer.appendChild(this.trackList.getElement());
    }
  }
}
