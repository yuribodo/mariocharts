# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2024-08-25

### Security
- **FIXED**: Critical path traversal vulnerability in `add` command
- **ADDED**: Strict path validation and sanitization functions
- **ADDED**: Component type validation
- **ADDED**: Filename sanitization to prevent malicious inputs
- **ADDED**: Multi-layer security checks for file operations

### Changed
- Enhanced error messages for security violations
- Improved logging for sanitized filenames

## [0.1.0] - 2024-08-25

### Added
- Initial release of Mario Charts CLI
- `init` command for project setup
- `add` command for installing components
- `list` command for available components
- Support for charts, UI, layout, filter, and primitive components