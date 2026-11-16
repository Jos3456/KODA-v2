import { TrackList } from "@/components/TrackList";
import { Track } from "@/types/library";
import { ViewMode } from "@/components/Toolbar";

export class QueueView {
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

  public setQueueTracks(tracks: Track[], currentTrackId?: string): void {
    this.trackList.updateTracks(tracks, currentTrackId);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Queue</h1>
        <button class="btn btn-secondary" id="btn-clear-queue">Clear Queue</button>
      </div>
      <div id="queue-list-container"></div>
    `;

    const listContainer = this.container.querySelector("#queue-list-container");
    if (listContainer) {
      listContainer.appendChild(this.trackList.getElement());
    }
  }
}
