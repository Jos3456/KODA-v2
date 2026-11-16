import { router, RouteName } from "./router";
import { Navigation } from "@/components/Navigation";
import { Toolbar, SortOption } from "@/components/Toolbar";
import { Player } from "@/components/Player";
import {
  SongsView, AlbumsView, ArtistsView, GenresView, PlaylistsView,
  FavouritesView, SettingsView, QueueView, NowPlayingView,
} from "@/views";
import { api } from "./api";
import { Album, Artist, Genre, Track } from "@/types/library";
import { Playlist } from "@/types/playlists";

export class App {
  private root: HTMLElement;
  private appContainer: HTMLElement;
  private viewContainer: HTMLElement;
  private navigation: Navigation;
  private toolbar: Toolbar;
  private player: Player;

  private songsView: SongsView;
  private albumsView: AlbumsView;
  private artistsView: ArtistsView;
  private genresView: GenresView;
  private playlistsView: PlaylistsView;
  private favouritesView: FavouritesView;
  private settingsView: SettingsView;
  private queueView: QueueView;
  private nowPlayingView: NowPlayingView;

  private libraryTracks: Track[] = [];
  private favouriteTracks: Track[] = [];
  private queueTracks: Track[] = [];
  private albums: Album[] = [];
  private artists: Artist[] = [];
  private genres: Genre[] = [];
  private playlists: Playlist[] = [];
  private searchQuery = "";
  private sortOption: SortOption = { field: "title", direction: "asc" };
  private currentTrack?: Track;
  private queueIndex = -1;

  constructor(root: HTMLElement) {
    this.root = root;
    this.navigation = new Navigation();
    this.player = new Player({
      onTogglePlayback: () => this.togglePlayback(),
      onSeek: (seconds) => this.seek(seconds),
      onNext: () => this.playRelativeTrack(1),
      onPrevious: () => this.playRelativeTrack(-1),
      onShowQueue: () => router.navigate("queue"),
      onShowTrackInfo: () => router.navigate("now-playing"),
      onAddToPlaylist: () => router.navigate("playlists"),
    });

    const handleTrackSelect = (track: Track) => this.playTrack(track);
    this.songsView = new SongsView(handleTrackSelect);
    this.albumsView = new AlbumsView();
    this.artistsView = new ArtistsView();
    this.genresView = new GenresView();
    this.playlistsView = new PlaylistsView();
    this.favouritesView = new FavouritesView(handleTrackSelect);
    this.queueView = new QueueView(handleTrackSelect);
    this.nowPlayingView = new NowPlayingView();

    this.toolbar = new Toolbar({
      onSearch: (query) => {
        this.searchQuery = query;
        this.applyToolbarFilters();
      },
      onSort: (sort) => {
        this.sortOption = sort;
        this.applyToolbarFilters();
      },
      onViewModeChange: (mode) => {
        this.songsView.setViewMode(mode);
        this.albumsView.setViewMode(mode);
        this.artistsView.setViewMode(mode);
        this.playlistsView.setViewMode(mode);
        this.favouritesView.setViewMode(mode);
      },
    });

    this.settingsView = new SettingsView({
      onSelectFolder: async () => {
        const folder = await api.selectMusicFolder();
        if (folder) {
          const updated = await api.updateSettings({ musicFolder: folder });
          this.settingsView.updateSettings(updated);
          await api.startLibraryScan();
          await this.loadLibraryData();
        }
      },
      onStartScan: async () => {
        await api.startLibraryScan();
        await this.loadLibraryData();
      },
      onUpdateSettings: async (changes) => {
        const updated = await api.updateSettings(changes);
        this.settingsView.updateSettings(updated);
        if (updated.theme) document.documentElement.setAttribute("data-theme", updated.theme);
      },
    });

    this.appContainer = document.createElement("div");
    this.appContainer.className = "app-container";
    this.viewContainer = document.createElement("main");
    this.viewContainer.className = "app-content";

    this.initLayout();
    this.initRouting();
    void this.loadInitialData();
  }

  private initLayout(): void {
    this.root.appendChild(this.navigation.getElement());
    this.root.appendChild(this.toolbar.getElement());
    this.appContainer.appendChild(this.viewContainer);
    this.root.appendChild(this.appContainer);
    this.root.appendChild(this.player.getElement());
    this.renderCurrentView(router.getRoute());
  }

  private initRouting(): void {
    router.subscribe((route) => this.renderCurrentView(route));
  }

  private renderCurrentView(route: RouteName): void {
    this.viewContainer.innerHTML = "";
    const views: Record<RouteName, HTMLElement> = {
      songs: this.songsView.getElement(),
      albums: this.albumsView.getElement(),
      artists: this.artistsView.getElement(),
      genres: this.genresView.getElement(),
      playlists: this.playlistsView.getElement(),
      favourites: this.favouritesView.getElement(),
      settings: this.settingsView.getElement(),
      queue: this.queueView.getElement(),
      "now-playing": this.nowPlayingView.getElement(),
    };
    this.viewContainer.appendChild(views[route]);
    this.applyToolbarFilters();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const settings = await api.getSettings();
      if (settings?.version) {
        this.settingsView.updateSettings(settings);
        if (settings.theme) document.documentElement.setAttribute("data-theme", settings.theme);
      }
    } catch (error) {
      console.warn("Could not load settings:", error);
    }
    await this.loadLibraryData();
  }

  private async loadLibraryData(): Promise<void> {
    const results = await Promise.allSettled([
      api.getLibraryPage(0, 500),
      api.getAlbums(),
      api.getArtists(),
      api.getGenres(),
      api.getPlaylists(),
      api.getFavourites(),
      api.getQueue(),
    ]);

    const value = <T,>(index: number, fallback: T): T =>
      results[index].status === "fulfilled" ? results[index].value as T : fallback;

    const page = value(0, undefined as never);
    this.libraryTracks = Array.isArray(page?.tracks) ? page.tracks : [];
    this.albums = Array.isArray(value(1, [] as Album[])) ? value(1, [] as Album[]) : [];
    this.artists = Array.isArray(value(2, [] as Artist[])) ? value(2, [] as Artist[]) : [];
    this.genres = Array.isArray(value(3, [] as Genre[])) ? value(3, [] as Genre[]) : [];
    this.playlists = Array.isArray(value(4, [] as Playlist[])) ? value(4, [] as Playlist[]) : [];
    this.favouriteTracks = Array.isArray(value(5, [] as Track[])) ? value(5, [] as Track[]) : [];
    this.queueTracks = Array.isArray(value(6, [] as Track[])) ? value(6, [] as Track[]) : [];

    const total = typeof page?.totalCount === "number" ? page.totalCount : this.libraryTracks.length;
    this.toolbar.setTrackCount(total);
    this.queueView.setQueueTracks(this.queueTracks, this.currentTrack?.id);
    this.applyToolbarFilters();
  }

  private sortTracks(tracks: Track[]): Track[] {
    const { field, direction } = this.sortOption;
    const multiplier = direction === "asc" ? 1 : -1;
    return [...tracks].sort((a, b) => {
      if (field === "durationSeconds") return (a.durationSeconds - b.durationSeconds) * multiplier;
      if (field === "dateAdded") return a.dateAdded.localeCompare(b.dateAdded) * multiplier;
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" }) * multiplier;
    });
  }

  private filterTracks(tracks: Track[]): Track[] {
    const query = this.searchQuery.toLocaleLowerCase();
    const filtered = query
      ? tracks.filter((track) => [track.title, track.artist, track.album, track.genre ?? ""]
          .some((field) => field.toLocaleLowerCase().includes(query)))
      : tracks;
    return this.sortTracks(filtered);
  }

  private applyToolbarFilters(): void {
    const query = this.searchQuery.toLocaleLowerCase();
    this.songsView.setTracks(this.filterTracks(this.libraryTracks), this.currentTrack?.id);
    this.favouritesView.setTracks(this.filterTracks(this.favouriteTracks), this.currentTrack?.id);
    this.queueView.setQueueTracks(this.filterTracks(this.queueTracks), this.currentTrack?.id);

    const contains = (value: string) => value.toLocaleLowerCase().includes(query);
    this.albumsView.setAlbums(this.albums.filter((item) => !query || contains(item.title) || contains(item.artist)));
    this.artistsView.setArtists(this.artists.filter((item) => !query || contains(item.name)));
    this.genresView.setGenres(this.genres.filter((item) => !query || contains(item.name)));
    this.playlistsView.setPlaylists(this.playlists.filter((item) => !query || contains(item.name)));
  }

  private async playTrack(track: Track): Promise<void> {
    try {
      await api.playTrack(track.id);
      this.currentTrack = track;
      this.queueIndex = this.queueTracks.findIndex((item) => item.id === track.id);
      this.player.updateState({ status: "playing", currentTrack: track, currentTimeSeconds: 0, durationSeconds: track.durationSeconds });
      this.nowPlayingView.setTrack(track);
      this.applyToolbarFilters();
    } catch (error) {
      console.error("Could not play track:", error);
    }
  }

  private async togglePlayback(): Promise<void> {
    if (!this.currentTrack) return;
    try {
      await api.togglePlayback();
      const nextStatus = this.player.getState().status === "playing" ? "paused" : "playing";
      this.player.updateState({ status: nextStatus });
    } catch (error) {
      console.error("Could not toggle playback:", error);
    }
  }

  private async seek(seconds: number): Promise<void> {
    try {
      await api.seekTo(seconds);
      this.player.updateState({ currentTimeSeconds: seconds });
    } catch (error) {
      console.error("Could not seek playback:", error);
    }
  }

  private async playRelativeTrack(offset: number): Promise<void> {
    if (this.queueTracks.length === 0) return;
    let index = this.queueIndex;
    if (index < 0 && this.currentTrack) index = this.queueTracks.findIndex((track) => track.id === this.currentTrack?.id);
    if (index < 0) index = offset > 0 ? -1 : 0;
    const nextIndex = (index + offset + this.queueTracks.length) % this.queueTracks.length;
    await this.playTrack(this.queueTracks[nextIndex]);
  }
}
