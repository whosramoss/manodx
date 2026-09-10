# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [1.0.1] - 2026-09-10

### Fixed

- Resolve ESM module paths so `npx manodx` works without extensionless import errors

## [1.0.0] - 2026-09-10

### Added

- Custom Markdown/MDX pipeline: AST, inline/block parser, frontmatter, HTML renderer
- File-based routing and document registry (`app/` content dir)
- Built-in components: `ManoCallout`, `ManoBadge`, `ManoWarning`, `ManoCard`
- `SiteApp` with unified header, light/dark theme, and fade page transitions
- CLI: `manodx init`, `dev`, `build`, `preview`
- Dev server (SSE live reload) and static builder with hashed assets
- Framework default favicons/OG thumbnail with site asset override
- Demo site under `www/` and API docs under `docs/API.md`

### Notes

- First stable release of the framework.

## [0.0.0] - 2026-07-23

### Added

- Initial public release of `manodx`.

[1.0.1]: https://github.com/whosramoss/manodx/releases/tag/v1.0.1
[1.0.0]: https://github.com/whosramoss/manodx/releases/tag/v1.0.0
[0.0.0]: https://github.com/whosramoss/manodx/releases/tag/v0.0.0
