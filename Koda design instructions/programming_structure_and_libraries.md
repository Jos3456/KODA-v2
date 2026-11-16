# Koda — Programming Structure and Libraries

## 1. Technology direction

Koda is being rebuilt in Rust. The first development and release target is Linux on Debian-based distributions, packaged as a `.deb`. Windows support is planned after the Linux version is stable; macOS may follow later.

The earlier project at [Jos3456/koda](https://github.com/Jos3456/koda) is the behavioural and feature reference. Its implementation used Electron, Node.js, HTML, CSS and JavaScript. **Do not carry the Electron/Node runtime or its package dependencies into this rebuild.** Reuse the product behaviour, not the old implementation architecture.

### Proposed application stack

| Area | Technology | Responsibility |
|---|---|---|
| Desktop shell | Tauri 2 | Native desktop window, application lifecycle, packaging and secure frontend/backend bridge |
| Core application logic | Rust | Library management, playback coordination, persistence and platform-independent behaviour |
| Frontend | HTML, CSS and TypeScript | Koda interface, navigation, views, interaction and visual themes |
| Frontend tooling | Vite | Development server and frontend asset bundling |
| Audio decoding/playback | Symphonia + a playback/output layer such as Rodio | Decode supported formats and send audio to the selected output device |
| Metadata | Lofty | Read tags and embedded artwork from local audio files |
| Filesystem traversal | Walkdir | Recursively discover audio files in selected folders |
| Local database | SQLite through rusqlite | Persist library index, playlists, favourites and related structured data |
| Serialization | Serde + serde_json | Typed data interchange and settings/configuration serialization |
| File watching | notify | Detect changes in selected music folders |
| Artwork processing | image | Decode, resize and derive colours from embedded artwork |
| Linux desktop integration | zbus, if needed | Investigate MPRIS/media-player integration on Linux |

These are proposed choices, not dependencies already installed or locked. Verify current crate versions, supported codecs, operating-system support and licence compatibility before adding them. Keep the initial dependency set small.

## 2. Architecture principles

1. **Keep the core independent of the UI.** Library, playback and persistence logic should not depend on DOM elements or frontend framework state.
2. **Keep platform-specific code at the edges.** Linux packaging and MPRIS integration must not leak into the core library model.
3. **Use typed boundaries.** Commands, events and persisted records should have explicit Rust types and validated inputs.
4. **Keep filesystem access in the backend.** The frontend requests operations; it should not receive unrestricted filesystem access.
5. **Do not block the UI.** Folder scans, metadata extraction, artwork processing and database work should run asynchronously or on suitable worker tasks.
6. **Treat the local library as an index, not ownership of files.** Store paths and metadata; never move or rewrite user audio files as part of scanning.
7. **Persist stable track identities.** Avoid relying only on list positions, since files can be added, removed or renamed.
8. **Handle errors explicitly.** Inaccessible folders, unsupported files, malformed tags, missing artwork and unavailable audio devices should produce recoverable errors.
9. **Keep the app offline-first.** Do not introduce network services for core functionality.
10. **Use semantic design tokens.** UI components should consume the shared palette and semantic theme variables rather than scattering raw hex values.

## 3. Suggested repository structure

Start with a single Tauri application and a modular Rust backend. Do not split the project into multiple crates until there is a clear need.

```text
KODA-v2/
├── src/                         # Frontend application
│   ├── app/                     # App bootstrap and top-level state
│   ├── components/              # Reusable UI components
│   ├── views/                   # Songs, albums, artists, genres, etc.
│   ├── styles/
│   │   ├── tokens.css           # Semantic colour and spacing tokens
│   │   ├── themes.css           # Light, dark and dynamic themes
│   │   └── components.css       # Shared component styling
│   ├── types/                   # Frontend types for backend contracts
│   └── main.ts                  # Frontend entry point
├── src-tauri/
│   ├── src/
│   │   ├── commands/            # Tauri command handlers
│   │   ├── library/             # Scanning, indexing and library models
│   │   ├── metadata/            # Tags and embedded artwork
│   │   ├── playback/            # Player state, queue and audio output
│   │   ├── playlists/           # Playlist and favourites operations
│   │   ├── settings/            # Preferences and migration
│   │   ├── storage/             # SQLite access and repositories
│   │   ├── platform/            # OS-specific integration
│   │   ├── error.rs             # Application error types
│   │   ├── state.rs             # Shared managed application state
│   │   └── lib.rs               # Tauri setup and module registration
│   ├── capabilities/            # Tauri permissions/capabilities
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── Koda design instructions/
├── Koda design structure/
├── package.json                 # Frontend tooling only
├── tsconfig.json
├── vite.config.ts
└── README.md
```

This is a suggested structure. Keep modules cohesive and avoid creating empty abstractions before they are needed.

## 4. Rust module responsibilities

### 4.1 `library/`

- Validate the selected music folder.
- Discover candidate audio files recursively.
- Filter supported file extensions and, where appropriate, confirm files can be parsed.
- Coordinate metadata extraction and database indexing.
- Reconcile added, removed and changed files.
- Expose paginated or filtered library queries to the frontend.
- Never delete or modify music files during a scan.

### 4.2 `metadata/`

- Extract title, artist, album, album artist, genre, year, track number and duration where available.
- Read embedded artwork.
- Normalise missing or malformed tags into safe fallback values.
- Keep decoder/metadata errors associated with the affected file rather than aborting an entire scan.

### 4.3 `playback/`

- Own the authoritative playback state.
- Load and play a track, pause, resume, stop and seek.
- Manage volume, mute, shuffle and repeat modes.
- Manage the queue and current queue position.
- Emit playback-state, position and track-change events to the frontend.
- Keep audio decoding and output work off the UI thread.
- Ensure that switching views does not interrupt playback.

Do not let the frontend become the source of truth for playback state. It should render state received from the backend and send user actions as commands.

### 4.4 `playlists/`

- Create, rename and delete playlists.
- Add and remove track IDs.
- Manage favourites.
- Support multi-track operations.
- Handle tracks that are no longer present in the scanned library.

### 4.5 `storage/`

Use SQLite for structured, queryable local data. Suggested records include:
- Tracks and their stable IDs / file paths.
- Indexed metadata and artwork references or cache keys.
- Playlists and playlist-track ordering.
- Favourites.
- User preferences where relational storage is useful.

Use database migrations from the beginning. Avoid storing large artwork blobs repeatedly in playlist or track records; use a managed artwork cache or file references where appropriate.

### 4.6 `settings/`

- Load and validate preferences at startup.
- Save changes safely.
- Provide defaults for missing settings.
- Version settings and migrate older formats.
- Persist appearance, folder, volume, playback preferences and visible library sections.

### 4.7 `platform/`

Keep operating-system-specific functionality behind small interfaces. Linux-specific MPRIS, media keys and packaging should live here or in clearly isolated platform modules. Windows equivalents can be added later without rewriting the core player.

## 5. Frontend responsibilities

The frontend is responsible for presentation and interaction:
- Main navigation and library views.
- Song list and grid layouts.
- Album, artist and genre detail pages.
- Playlist and favourites screens.
- Queue and Now Playing views.
- Settings and theme controls.
- Loading, empty, error and missing-artwork states.
- Accessible keyboard interactions and responsive desktop layout.

The frontend should communicate with Rust through typed Tauri commands and events. Do not access Node.js APIs, use Electron IPC, or enable unrestricted filesystem access.

Use the design references in `Koda design structure/` and the semantic tokens in `colour_palette.md`. Keep UI components reusable and avoid duplicating playback logic in individual screens.

## 6. Command and event boundaries

Use Tauri commands for request/response operations, for example:
- `select_music_folder`
- `start_library_scan`
- `get_library_page`
- `get_album_details`
- `get_artist_details`
- `play_track`
- `toggle_playback`
- `seek_to`
- `set_volume`
- `set_repeat_mode`
- `set_shuffle`
- `get_queue`
- `create_playlist`
- `add_tracks_to_playlist`
- `toggle_favourite`
- `get_settings`
- `update_settings`

Use backend events for ongoing or asynchronous changes, for example:
- `scan-progress`
- `scan-completed`
- `library-changed`
- `playback-state-changed`
- `track-changed`
- `playback-position`
- `queue-changed`

These are naming examples. Define the actual command and event contracts once, with typed request and response structures. Do not emit an event for every tiny state change if a single structured update is more efficient.

## 7. Audio and format support

Symphonia is the proposed decoding foundation because it supports several common audio formats. Rodio may provide a convenient playback/output layer, but confirm its current backend and codec feature configuration before committing to it.

The old Koda project listed MP3, FLAC, WAV, AAC, OGG, M4A, WMA, OPUS and AIFF. Do not assume every one of these formats is supported automatically by the selected Rust stack. Create a format test set and verify:
- Successful decoding and playback.
- Duration and seeking behaviour.
- Metadata extraction.
- Embedded artwork extraction.
- Variable-bitrate and unusual file handling.
- Behaviour for corrupt or unsupported files.

Document any format that is not supported rather than silently claiming compatibility.

## 8. Security and data safety

- Keep Tauri's frontend isolation and security defaults enabled.
- Define the smallest possible Tauri capability permissions.
- Do not enable Node integration or expose arbitrary shell execution.
- Validate every path and command argument received from the frontend.
- Restrict file operations to explicitly selected locations and user-confirmed actions.
- Do not provide a generic frontend command that can delete arbitrary files.
- Use parameterised SQL queries.
- Avoid logging private file contents or unnecessary full paths.
- Make destructive actions explicit, confirmable and recoverable where practical.
- Test database migrations and settings recovery.

## 9. Linux build and packaging

Linux is the first-class development target.

- Build and test on the current Debian-based development environment.
- Configure Tauri's Linux dependencies according to its official prerequisites.
- Produce a `.deb` package using Tauri's bundling configuration.
- Test installation and launch on a clean Debian/Ubuntu-compatible environment.
- Verify audio output, folder permissions, artwork, keyboard shortcuts and settings persistence after installation.
- Keep build instructions reproducible and document required system packages.
- Do not assume a successful development build guarantees a working packaged application.

Windows packaging should be added after the Linux application is stable. Keep paths, file dialogs, audio output and platform integration behind portable abstractions.

## 10. Development and testing approach

- Use `cargo fmt` and `cargo clippy` regularly.
- Add unit tests for library models, queue behaviour, repeat/shuffle logic, settings validation and persistence.
- Add integration tests for scanning, metadata extraction and database migrations.
- Test with a small curated audio fixture set covering each supported format.
- Test empty folders, inaccessible folders, duplicate metadata, missing artwork, malformed tags and files removed during playback.
- Keep UI and backend contracts in sync.
- Build and test a Linux package before calling a milestone complete.

## 11. Implementation order

1. Create the Tauri 2 + Rust + Vite application shell and verify a Linux `.deb` build.
2. Implement typed application state, settings and SQLite migrations.
3. Implement folder selection, scanning, metadata extraction and library indexing.
4. Implement reliable audio output and basic playback controls.
5. Add Songs view, search, list/grid layout and persistent mini-player.
6. Add albums, artists, genres and detail views.
7. Add queue, shuffle, repeat, favourites and playlists.
8. Add artwork-derived dynamic theming and complete light/dark themes.
9. Add keyboard shortcuts and Linux desktop media integration.
10. Polish accessibility, performance, packaging and recovery behaviour.
11. Begin Windows support once the Linux milestone is stable.

## 12. Dependency policy

- Prefer actively maintained crates with clear licences and a track record of cross-platform support.
- Pin compatible versions through Cargo's lockfile for reproducible builds.
- Enable only the features actually needed.
- Review transitive dependencies and licences before release.
- Do not add a crate for a feature that can be implemented more simply with the existing stack.
- Re-check platform support before adding any library that could block Windows or macOS later.
