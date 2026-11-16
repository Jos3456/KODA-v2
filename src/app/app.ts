import { router, RouteName } from "./router";
import { Navigation } from "@/components/Navigation";
import { Player } from "@/components/Player";
import {
  SongsView,
  AlbumsView,
  ArtistsView,
  GenresView,
  PlaylistsView,
  FavouritesView,
  SettingsView,
  QueueView,
  NowPlayingView,
} from "@/views";
import { api } from "./api";
import { Track } from "@/types/library";

export class App {
  private root: HTMLElement;
  private appContainer: HTMLElement;
  private viewContainer: HTMLElement;
  private navigation: Navigation;
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

  constructor(root: HTMLElement) {
    this.root = root;
    this.navigation = new Navigation();
    this.player = new Player();

    const handleTrackSelect = (track: Track) => {
      api.playTrack(track.id);
      this.player.updateState({
        status: "playing",
        currentTrack: track,
        currentTimeSeconds: 0,
        durationSeconds: track.durationSeconds,
      });
      this.nowPlayingView.setTrack(track);
    };

    this.songsView = new SongsView(handleTrackSelect);
    this.albumsView = new AlbumsView();
    this.artistsView = new ArtistsView();
    this.genresView = new GenresView();
    this.playlistsView = new PlaylistsView();
    this.favouritesView = new FavouritesView(handleTrackSelect);
    this.queueView = new QueueView(handleTrackSelect);
    this.nowPlayingView = new NowPlayingView();

    this.settingsView = new SettingsView({
      onSelectFolder: async () => {
        const folder = await api.selectMusicFolder();
        if (folder) {
          const updated = await api.updateSettings({ musicFolder: folder });
          this.settingsView.updateSettings(updated);
          await api.startLibraryScan();
        }
      },
      onStartScan: async () => {
        await api.startLibraryScan();
      },
      onUpdateSettings: async (changes) => {
        const updated = await api.updateSettings(changes);
        this.settingsView.updateSettings(updated);
        if (updated.theme) {
          document.documentElement.setAttribute("data-theme", updated.theme);
        }
      },
    });

    this.appContainer = document.createElement("div");
    this.appContainer.className = "app-container";

    this.viewContainer = document.createElement("main");
    this.viewContainer.style.flex = "1";
    this.viewContainer.style.display = "flex";
    this.viewContainer.style.flexDirection = "column";
    this.viewContainer.style.minWidth = "0";

    this.initLayout();
    this.initRouting();
    this.loadInitialData();
  }

  private initLayout(): void {
    this.appContainer.appendChild(this.navigation.getElement());
    this.appContainer.appendChild(this.viewContainer);

    this.root.appendChild(this.appContainer);
    this.root.appendChild(this.player.getElement());

    this.renderCurrentView(router.getRoute());
  }

  private initRouting(): void {
    router.subscribe((route) => {
      this.renderCurrentView(route);
    });
  }

  private renderCurrentView(route: RouteName): void {
    this.viewContainer.innerHTML = "";

    switch (route) {
      case "songs":
        this.viewContainer.appendChild(this.songsView.getElement());
        break;
      case "albums":
        this.viewContainer.appendChild(this.albumsView.getElement());
        break;
      case "artists":
        this.viewContainer.appendChild(this.artistsView.getElement());
        break;
      case "genres":
        this.viewContainer.appendChild(this.genresView.getElement());
        break;
      case "playlists":
        this.viewContainer.appendChild(this.playlistsView.getElement());
        break;
      case "favourites":
        this.viewContainer.appendChild(this.favouritesView.getElement());
        break;
      case "settings":
        this.viewContainer.appendChild(this.settingsView.getElement());
        break;
      case "queue":
        this.viewContainer.appendChild(this.queueView.getElement());
        break;
      case "now-playing":
        this.viewContainer.appendChild(this.nowPlayingView.getElement());
        break;
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      const settings = await api.getSettings();
      if (settings && settings.version) {
        this.settingsView.updateSettings(settings);
        if (settings.theme) {
          document.documentElement.setAttribute("data-theme", settings.theme);
        }
      }

      const libraryPage = await api.getLibraryPage(0, 100);
      if (libraryPage && libraryPage.tracks) {
        this.songsView.setTracks(libraryPage.tracks);
      }
    } catch (err) {
      console.warn("Could not load initial settings/library:", err);
    }
  }
}
