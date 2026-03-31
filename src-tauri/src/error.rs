use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Config error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("No workspace opened")]
    NoWorkspace,

    #[error("Path outside workspace: {0}")]
    PathTraversal(String),

    #[error("Invalid path: {0}")]
    InvalidPath(String),

    #[error("Font enumeration failed: {0}")]
    FontKit(String),
}

impl Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeStruct;
        let mut s = serializer.serialize_struct("AppError", 2)?;
        s.serialize_field("code", &self.error_code())?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}

impl AppError {
    fn error_code(&self) -> &'static str {
        match self {
            Self::Io(_) => "IO_ERROR",
            Self::Yaml(_) => "CONFIG_ERROR",
            Self::NoWorkspace => "NO_WORKSPACE",
            Self::PathTraversal(_) => "PATH_TRAVERSAL",
            Self::InvalidPath(_) => "INVALID_PATH",
            Self::FontKit(_) => "FONT_ERROR",
        }
    }
}
