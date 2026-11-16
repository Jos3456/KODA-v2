#[cfg(target_os = "linux")]
pub mod linux;

pub fn init_platform() {
    #[cfg(target_os = "linux")]
    linux::LinuxPlatform::init();
}
