use crate::error::{AppError, AppResult};
use crate::library::Track;
use crate::playback::queue::QueueManager;
use crate::playback::state::{PlaybackState, PlaybackStatus, RepeatMode};
use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::sync::mpsc::{channel, Sender};
use std::thread;

pub enum AudioCommand {
    Play { path: String, volume: f32 },
    TogglePlayback,
    Pause,
    Resume,
    Stop,
    SetVolume(f32),
}

pub struct AudioPlayer {
    cmd_tx: Option<Sender<AudioCommand>>,
    pub queue: QueueManager,
    pub state: PlaybackState,
}

impl AudioPlayer {
    pub fn new() -> Self {
        let (cmd_tx, cmd_rx) = channel::<AudioCommand>();

        let worker_spawn = thread::Builder::new()
            .name("koda-audio-worker".into())
            .spawn(move || {
                let stream_res = OutputStream::try_default();
                let (_stream, stream_handle) = match stream_res {
                    Ok((s, h)) => (Some(s), Some(h)),
                    Err(e) => {
                        eprintln!("Warning: Failed to open default audio output stream: {}", e);
                        (None, None)
                    }
                };

                let mut current_sink: Option<Sink> = None;

                while let Ok(cmd) = cmd_rx.recv() {
                    match cmd {
                        AudioCommand::Play { path, volume } => {
                            if let Some(ref handle) = stream_handle {
                                match File::open(Path::new(&path)) {
                                    Ok(file) => {
                                        let reader = BufReader::new(file);
                                        match Decoder::new(reader) {
                                            Ok(source) => match Sink::try_new(handle) {
                                                Ok(sink) => {
                                                    sink.set_volume(volume);
                                                    sink.append(source);
                                                    sink.play();
                                                    current_sink = Some(sink);
                                                }
                                                Err(e) => eprintln!("Error creating sink: {}", e),
                                            },
                                            Err(e) => eprintln!(
                                                "Error decoding audio file {}: {}",
                                                path, e
                                            ),
                                        }
                                    }
                                    Err(e) => eprintln!("Error opening audio file {}: {}", path, e),
                                }
                            }
                        }
                        AudioCommand::TogglePlayback => {
                            if let Some(ref sink) = current_sink {
                                if sink.is_paused() {
                                    sink.play();
                                } else {
                                    sink.pause();
                                }
                            }
                        }
                        AudioCommand::Pause => {
                            if let Some(ref sink) = current_sink {
                                sink.pause();
                            }
                        }
                        AudioCommand::Resume => {
                            if let Some(ref sink) = current_sink {
                                sink.play();
                            }
                        }
                        AudioCommand::Stop => {
                            if let Some(ref sink) = current_sink {
                                sink.stop();
                            }
                            current_sink = None;
                        }
                        AudioCommand::SetVolume(vol) => {
                            if let Some(ref sink) = current_sink {
                                sink.set_volume(vol);
                            }
                        }
                    }
                }
            });

        let tx = match worker_spawn {
            Ok(_) => Some(cmd_tx),
            Err(e) => {
                eprintln!("Failed to spawn audio worker thread: {}", e);
                None
            }
        };

        Self {
            cmd_tx: tx,
            queue: QueueManager::new(),
            state: PlaybackState::default(),
        }
    }

    pub fn play_track(&mut self, track: Track) -> AppResult<()> {
        if let Some(ref tx) = self.cmd_tx {
            let volume = if self.state.is_muted {
                0.0
            } else {
                self.state.volume
            };
            tx.send(AudioCommand::Play {
                path: track.file_path.clone(),
                volume,
            })
            .map_err(|e| AppError::Playback(e.to_string()))?;

            self.state.status = PlaybackStatus::Playing;
            self.state.duration_seconds = track.duration_seconds;
            self.state.current_time_seconds = 0.0;
            self.state.current_track = Some(track);

            Ok(())
        } else {
            Err(AppError::Playback(
                "Audio worker is not available".to_string(),
            ))
        }
    }

    pub fn toggle_playback(&mut self) -> AppResult<()> {
        if let Some(ref tx) = self.cmd_tx {
            tx.send(AudioCommand::TogglePlayback)
                .map_err(|e| AppError::Playback(e.to_string()))?;

            if self.state.status == PlaybackStatus::Playing {
                self.state.status = PlaybackStatus::Paused;
            } else if self.state.status == PlaybackStatus::Paused {
                self.state.status = PlaybackStatus::Playing;
            }
            Ok(())
        } else {
            Ok(())
        }
    }

    pub fn pause(&mut self) {
        if let Some(ref tx) = self.cmd_tx {
            let _ = tx.send(AudioCommand::Pause);
            self.state.status = PlaybackStatus::Paused;
        }
    }

    pub fn stop(&mut self) {
        if let Some(ref tx) = self.cmd_tx {
            let _ = tx.send(AudioCommand::Stop);
            self.state.status = PlaybackStatus::Stopped;
            self.state.current_time_seconds = 0.0;
        }
    }

    pub fn set_volume(&mut self, volume: f32) {
        let clamped = volume.clamp(0.0, 1.0);
        self.state.volume = clamped;
        if !self.state.is_muted {
            if let Some(ref tx) = self.cmd_tx {
                let _ = tx.send(AudioCommand::SetVolume(clamped));
            }
        }
    }

    pub fn set_repeat_mode(&mut self, mode: RepeatMode) {
        self.state.repeat_mode = mode;
    }

    pub fn set_shuffle(&mut self, shuffle: bool) {
        self.state.is_shuffle = shuffle;
    }
}

impl Default for AudioPlayer {
    fn default() -> Self {
        Self::new()
    }
}
