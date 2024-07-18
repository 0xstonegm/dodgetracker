use chrono::Utc;
use tracing::level_filters::LevelFilter;
use tracing_appender::{
    non_blocking::WorkerGuard,
    rolling::{RollingFileAppender, Rotation},
};
use tracing_subscriber::fmt::time::FormatTime;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, Layer};

struct CustomTimeFormatter;

impl FormatTime for CustomTimeFormatter {
    fn format_time(&self, w: &mut tracing_subscriber::fmt::format::Writer<'_>) -> std::fmt::Result {
        let now = Utc::now();
        write!(w, "{}", now.format("%y-%m-%dT%H:%M:%S%.3fZ"))
    }
}

pub fn init() -> (WorkerGuard, WorkerGuard) {
    let file_appender = RollingFileAppender::builder()
        .rotation(Rotation::HOURLY)
        .filename_prefix("dodgetracker-log")
        .filename_suffix("log")
        .max_log_files(72) // three days worth of logs
        .build(".log/")
        .unwrap();

    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    // File appender for JSON logs
    let json_appender = RollingFileAppender::builder()
        .rotation(Rotation::DAILY)
        .filename_prefix("dodgetracker-log-json")
        .filename_suffix("log")
        .max_log_files(3)
        .build(".log/json/")
        .unwrap();

    let (json_non_blocking, _json_guard) = tracing_appender::non_blocking(json_appender);

    // Layer for formatted logs with custom time formatter
    let fmt_layer = fmt::layer()
        .with_timer(CustomTimeFormatter)
        .with_target(false)
        .with_writer(non_blocking)
        .with_filter(LevelFilter::INFO);

    // Layer for JSON logs
    let json_layer = fmt::layer()
        .json()
        .with_target(false)
        .with_writer(json_non_blocking)
        .with_filter(LevelFilter::INFO);

    // Combine the layers
    tracing_subscriber::registry()
        .with(fmt_layer)
        .with(json_layer)
        .init();

    (_guard, _json_guard)
}
