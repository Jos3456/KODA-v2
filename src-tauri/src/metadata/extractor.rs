use crate::error::{AppError, AppResult};
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::probe::Probe;
use lofty::tag::Accessor;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct ExtractedMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub album_artist: Option<String>,
    pub genre: Option<String>,
    pub year: Option<u32>,
    pub track_number: Option<u32>,
    pub duration_seconds: f64,
    pub has_artwork: bool,
    pub artwork_data: Option<Vec<u8>>,
    pub artwork_mime: Option<String>,
}

pub fn extract_metadata(path: &Path) -> AppResult<ExtractedMetadata> {
    let tagged_file = Probe::open(path)
        .map_err(|e| AppError::Metadata(format!("Failed to open file {:?}: {}", path, e)))?
        .read()
        .map_err(|e| AppError::Metadata(format!("Failed to read tags {:?}: {}", path, e)))?;

    let properties = tagged_file.properties();
    let duration_seconds = properties.duration().as_secs_f64();

    // Default fallback values based on file name
    let filename_fallback = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown Title")
        .to_string();

    let tag = tagged_file
        .primary_tag()
        .or_else(|| tagged_file.first_tag());

    if let Some(tag) = tag {
        let title = tag
            .title()
            .map(|s| s.to_string())
            .unwrap_or(filename_fallback);
        let artist = tag
            .artist()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "Unknown Artist".to_string());
        let album = tag
            .album()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "Unknown Album".to_string());
        let genre = tag.genre().map(|s| s.to_string());
        let year = tag.year();
        let track_number = tag.track();

        // Extract artwork if present
        let picture = tag.pictures().first();
        let (has_artwork, artwork_data, artwork_mime) = if let Some(pic) = picture {
            (
                true,
                Some(pic.data().to_vec()),
                pic.mime_type().map(|m| m.as_str().to_string()),
            )
        } else {
            (false, None, None)
        };

        Ok(ExtractedMetadata {
            title,
            artist,
            album,
            album_artist: None,
            genre,
            year,
            track_number,
            duration_seconds,
            has_artwork,
            artwork_data,
            artwork_mime,
        })
    } else {
        Ok(ExtractedMetadata {
            title: filename_fallback,
            artist: "Unknown Artist".to_string(),
            album: "Unknown Album".to_string(),
            album_artist: None,
            genre: None,
            year: None,
            track_number: None,
            duration_seconds,
            has_artwork: false,
            artwork_data: None,
            artwork_mime: None,
        })
    }
}
