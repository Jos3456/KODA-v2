# Koda — Project Description

## 1. Overview

Koda is a modern, minimal, offline-first desktop music player built around the user's own local music collection.

Its guiding idea is simple: **listening to music should be fun too.** Koda should make a personal music library feel inviting, organised and enjoyable without requiring an account, a streaming subscription or an internet connection.

The new Koda project is a cross-platform desktop application written primarily in Rust. Development and the first distributable release will target **Linux (Debian-based distributions, packaged as a `.deb`)**. Windows support is planned after the Linux version is stable. The architecture should avoid unnecessary platform-specific dependencies so that macOS can remain a possible future target.

The earlier Koda implementation in [Jos3456/koda](https://github.com/Jos3456/koda) is the functional reference for the feature set and product behaviour. The current repository's screenshots define the visual direction for the redesigned interface. The new application is a Rust-based rebuild, not an Electron port.

## 2. Product principles

- **Local-first:** the user's music stays on their device. Koda does not require an online account or streaming service.
- **Offline by default:** core library, playback and playlist features must work without an internet connection.
- **Personal library ownership:** users choose which folders Koda scans; the application should not move or modify music files unless the user explicitly requests a file operation.
- **Simple and focused:** keep common listening actions easy to find and avoid unnecessary interface clutter.
- **Personal expression:** album artwork can influence the interface's accent colours while preserving readable text and controls.
- **Cross-platform foundation:** keep the product and core logic portable, while respecting each operating system's conventions where appropriate.
- **Accessible and responsive:** support keyboard use, clear focus states, useful empty states and practical window resizing.

## 3. Core features

The following feature set carries forward the behaviour and capabilities of the earlier Koda application. It is the intended product scope for the rebuild; it should not be interpreted as a claim that these features are already implemented in this repository.

### 3.1 Music library and folder scanning

- Let the user choose a music folder.
- Recursively scan the selected folder for supported audio files.
- Read embedded audio metadata, including title, artist, album, genre, year, track number and duration where available.
- Read embedded album artwork where available.
- Use sensible fallback values when tags or artwork are missing.
- Keep the library in sync when files are added or removed from the selected folder.
- Allow the user to change the selected music folder.
- Do not upload, copy, move or alter music files during normal scanning and playback.

Initial audio-format targets inherited from the previous implementation:
- MP3
- FLAC
- WAV
- AAC
- OGG Vorbis
- M4A
- WMA
- Opus
- AIFF

Actual format support will depend on the decoder libraries selected for the Rust implementation and must be tested before being advertised. In particular, formats such as WMA may require additional decoder support.

### 3.2 Library browsing

Provide dedicated views for:
- **Songs** — the complete music collection.
- **Albums** — albums grouped from track metadata.
- **Artists** — artists grouped from track metadata.
- **Genres** — genres grouped from track metadata.
- **Favourites** — tracks the user has marked as favourites.
- **Playlists** — user-created collections.

Songs and favourites should support list and grid layouts. Album, artist and genre collections should use browsable artwork-led grids, with detail pages that show the tracks belonging to the selected item.

Settings should allow optional library sections (such as Albums, Artists and Genres) to be shown or hidden without deleting their underlying music.

### 3.3 Search

- Search the local library by song title, artist, album and genre.
- Update results as the user types.
- Provide a clear-search action and a useful no-results state.
- Searching must work offline.

### 3.4 Playback

- Play and pause the current track.
- Move to the previous or next track.
- Seek through the current track.
- Adjust volume and support mute.
- Display track title, artist, album artwork and playback progress.
- Support shuffle.
- Support repeat modes: off, repeat all and repeat one.
- Preserve a consistent playback experience while navigating between library views.
- Provide a persistent player and a more detailed Now Playing experience.

### 3.5 Queue management

- Show the current play queue.
- Navigate to tracks in the queue.
- Add tracks to the queue and keep the current playback position clear.
- Support sensible queue behaviour when tracks are removed from the library.
- Provide queue controls from the player.

Drag-and-drop queue reordering is a desired improvement for the rebuilt application and should be implemented with clear keyboard-accessible alternatives.

### 3.6 Favourites and playlists

- Mark and unmark tracks as favourites.
- Create, rename and delete user playlists.
- Add tracks to and remove tracks from playlists.
- Support selecting multiple tracks for playlist actions.
- Allow a custom playlist cover image where practical.
- Keep playlist membership stable when the library is rescanned.
- Handle missing or deleted tracks without corrupting playlists.

### 3.7 Dynamic appearance and themes

- Offer a light and dark appearance.
- Offer an optional dynamic theme derived from the currently playing track's album artwork.
- Apply the artwork-derived colour as a subtle application-wide accent or glow, not as an overpowering full-screen tint.
- Keep text, icons, controls and focus indicators readable in both themes.
- Use a deliberate fallback theme when artwork is missing or dynamic theming is disabled.
- Use the palette in `colour_palette.md` as the starting point for Koda's visual identity.

### 3.8 Settings and persistence

Persist user preferences between launches, including where applicable:
- Selected music folder.
- Volume and mute state.
- Shuffle and repeat mode.
- Light/dark appearance and dynamic-theme preference.
- Visible library sections.
- Preferred list/grid layout.
- Favourites and playlists.
- Other playback and interface preferences as they are introduced.

Settings and library data should be stored locally. A corrupted or outdated settings file/database should fail safely and must not cause the user's music files to be changed.

### 3.9 Keyboard and desktop integration

Initial keyboard shortcut targets:
| Shortcut | Action |
|---|---|
| `Space` | Play / pause |
| `←` / `→` | Seek backward / forward by 5 seconds |
| `Ctrl + ←` | Previous track |
| `Ctrl + →` | Next track |
| `↑` / `↓` | Volume up / down |

Shortcuts must not interfere with normal text entry. Where supported, integrate with operating-system media keys and desktop media controls. Linux MPRIS integration is a platform-specific enhancement to investigate during Linux development.

## 4. Interface and visual direction

The screenshots in `Koda design structure/` are the current visual references:

- `Koda - Songs Page.png`
- `Koda - Artist & Album Page.png`
- `Koda - Playlist Page.png`
- `Koda - Queue View.png`
- `Koda - Now Playing View.png`
- `Koda - Settings Page.png`

The interface should retain the warm, expressive Koda identity:
- Deep brown, terracotta, coral and peach as the main brand family.
- Cream and other soft neutral surfaces for readable content areas.
- Rounded cards and artwork-led browsing.
- Clear, consistent navigation between library sections.
- A persistent player that remains available while browsing.
- Subtle motion and transitions rather than distracting animation.
- Consistent sizing, spacing and alignment across song rows, cards and controls.
- Useful loading, empty, missing-artwork and error states.
- Resizable layouts with minimum sizes that keep important controls visible.

The screenshots are design references, not a reason to hard-code dimensions. The interface must adapt to different desktop window sizes.

## 5. Platform and release scope

### Phase 1 — Linux

- Develop and test on Linux first.
- Prioritise Debian-based distributions.
- Produce a native `.deb` package.
- Follow Linux filesystem, audio-device and desktop-integration conventions.
- Verify installation, launch, playback, settings persistence and clean uninstall behaviour.

### Phase 2 — Windows

- Reuse the Rust core and shared frontend.
- Add and test Windows-specific packaging and desktop integration.
- Produce a Windows installer after the Linux build is stable.

### Future possibility — macOS

Keep the architecture portable enough to support macOS later, but do not let unverified macOS requirements complicate the initial Linux release.

## 6. Non-goals

Unless explicitly agreed later, Koda is not intended to be:
- A music streaming service.
- A social music network.
- A cloud music locker or account-based library.
- A Spotify, Apple Music or YouTube Music client.
- Dependent on an internet connection for ordinary playback.
- A tool that silently edits, reorganises or deletes the user's music files.

## 7. Development status and scope discipline

This document describes the intended product and carries forward the feature scope of the earlier Koda project. It is not a completion checklist.

Features should be implemented incrementally, tested on Linux and marked complete only when they work in the Rust rebuild. The first milestone should establish a reliable application shell, folder selection and scanning, metadata extraction, a browsable library and dependable audio playback before expanding into advanced themes and desktop integrations.
