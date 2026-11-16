use crate::library::Track;

#[derive(Debug, Default)]
pub struct QueueManager {
    items: Vec<Track>,
    current_index: Option<usize>,
    shuffle_order: Vec<usize>,
}

impl QueueManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_items(&mut self, items: Vec<Track>, start_index: Option<usize>) {
        self.items = items;
        self.current_index = start_index;
        self.rebuild_shuffle();
    }

    pub fn current_track(&self) -> Option<&Track> {
        self.current_index.and_then(|idx| self.items.get(idx))
    }

    pub fn next(&mut self, repeat_all: bool) -> Option<&Track> {
        if self.items.is_empty() {
            return None;
        }

        let next_idx = match self.current_index {
            Some(idx) => {
                if idx + 1 < self.items.len() {
                    Some(idx + 1)
                } else if repeat_all {
                    Some(0)
                } else {
                    None
                }
            }
            None => Some(0),
        };

        self.current_index = next_idx;
        self.current_track()
    }

    pub fn previous(&mut self) -> Option<&Track> {
        if self.items.is_empty() {
            return None;
        }

        let prev_idx = match self.current_index {
            Some(idx) => {
                if idx > 0 {
                    Some(idx - 1)
                } else {
                    Some(0)
                }
            }
            None => Some(0),
        };

        self.current_index = prev_idx;
        self.current_track()
    }

    pub fn get_items(&self) -> &[Track] {
        &self.items
    }

    pub fn clear(&mut self) {
        self.items.clear();
        self.current_index = None;
        self.shuffle_order.clear();
    }

    fn rebuild_shuffle(&mut self) {
        self.shuffle_order = (0..self.items.len()).collect();
    }
}
