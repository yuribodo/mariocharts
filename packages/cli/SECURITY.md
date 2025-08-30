# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.1   | :white_check_mark: |
| < 0.1.1 | :x:                |

## Security Updates

### Version 0.1.1
- **FIXED**: Path Traversal Vulnerability in `add` command
  - Added strict path validation and sanitization
  - Prevents writing files outside intended directories
  - Enhanced input validation for component types and filenames

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@mariocharts.com or create a private security advisory on GitHub.

We will respond within 48 hours and work to resolve the issue as quickly as possible.