# Koda

A modern, minimal, offline-first desktop music player built around your own local music collection.

Rebuilt from the ground up in **Rust** and **Tauri 2**, targeting Linux (Debian-based `.deb` packages) as its primary release platform, with Windows support planned next.

---

## Technology Stack

- **Desktop Shell:** Tauri 2
- **Core Backend:** Rust
- **Audio Output & Decoding:** Symphonia + Rodio
- **Audio Metadata & Artwork:** Lofty
- **Database & Persistence:** SQLite via `rusqlite` with automated migrations
- **Directory Traversal:** `walkdir`
- **Frontend:** TypeScript, HTML5, CSS3 (Semantic CSS Tokens)
- **Frontend Tooling:** Vite

---

## Repository Structure

```text
KODA-v2/
├── src/                         # Frontend application
│   ├── app/                     # App bootstrap, routing, and API contracts
│   ├── components/              # Reusable UI components (Player, Navigation, TrackList)
│   ├── views/                   # Songs, albums, artists, genres, playlists, favourites, settings
│   ├── styles/
│   │   ├── tokens.css           # Semantic colour, spacing, and elevation tokens
│   │   ├── themes.css           # Light (Warm palette), dark, and dynamic theme variables
│   │   └── components.css       # Shared component styling
│   ├── types/                   # Typed contracts between frontend and backend
│   └── main.ts                  # Frontend entry point
├── src-tauri/
│   ├── src/
│   │   ├── commands/            # Tauri IPC command handlers
│   │   ├── library/             # Folder scanning, audio discovery, and library models
│   │   ├── metadata/            # Tag extraction and embedded artwork
│   │   ├── playback/            # Player state, queue management, and audio output
│   │   ├── playlists/           # Playlist and favourites operations
│   │   ├── settings/            # User preferences and persistence
│   │   ├── storage/             # SQLite connection and migrations
│   │   ├── platform/            # OS-specific integrations (Linux MPRIS)
│   │   ├── error.rs             # Application error types
│   │   ├── state.rs             # Thread-safe managed application state
│   │   ├── lib.rs               # Tauri setup, state registration, and command registry
│   │   └── main.rs              # Application binary entry point
│   ├── capabilities/            # Tauri v2 security capabilities
│   ├── icons/                   # Application icons
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri application configuration
├── Koda design instructions/    # Architecture, palette, and project specs
├── Koda design structure/       # UI design mockups and reference screens
├── package.json                 # Frontend dependencies and scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
└── README.md
```

---

## Development Setup

### Prerequisites

#### Linux (Debian / Ubuntu)

Install system dependencies required for Tauri 2 and audio playback:

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  curl \
  libwebkit2gtk-4.1-dev \
  libssl-dev \
  libasound2-dev
```

Ensure Node.js and Rust are installed:

- **Node.js**: v18+ (tested on v24)
- **Rust**: 1.77+ (tested on 1.80+)

### Installing Dependencies

```bash
# Install frontend dependencies
npm install
```

### Running in Development

```bash
# Run Vite dev server + Tauri desktop shell
npm run tauri dev
```

Or run frontend preview independently in browser:

```bash
npm run dev
```

### Building for Production (Linux `.deb`)

```bash
npm run tauri build
```

The resulting package will be located in `src-tauri/target/release/bundle/deb/`.
