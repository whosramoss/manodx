# Contributing to manodx

Thank you for your interest in contributing. This guide covers local setup, workflow, and project structure.

## Prerequisites

- Node.js **18+**
- npm (or a compatible package manager)

## Local setup

```bash
git clone https://github.com/whosramoss/manodx.git
cd manodx
npm install
```

### Running the demo site

```bash
cd www
npm install
npm run dev
```

Opens the development server at `http://localhost:4554` with hot reload.

### Testing the init command

```bash
npx tsx src/cli/index.ts init test-site
cd test-site
npm install
npm run dev
```

Creates a new project with example files.

### Building for production

```bash
cd www
npm run build
npm run preview
```

Generates static files in `www/dist/` and serves them at `http://localhost:4173`.

## Project structure

```
manodx/
├── src/                  # Framework source code
│   ├── assets/           # Default favicons and thumbnail
│   ├── core/             # Markdown parser and renderer
│   ├── config/           # Components, styles, and app class
│   ├── content/          # Document and registry
│   ├── loader/           # File system utilities
│   ├── router/           # Path resolution
│   ├── server/           # Dev and preview servers
│   ├── build/            # Static site generator
│   ├── runtime/          # Browser bootstrap
│   ├── site/             # Main API facade
│   └── cli/              # CLI commands (init, dev, build, preview)
├── www/                  # Demo site (not published to npm)
│   ├── app/              # Markdown content
│   ├── assets/           # Site-specific assets
│   └── manodx.config.ts  # Site configuration
├── docs/                 # API documentation
└── package.json
```

## Development scripts

| Script                  | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `npm run dev` (in www/) | Start dev server with hot reload             |
| `npm run build`         | Generate static site in `dist/`              |
| `npm run preview`       | Preview production build locally             |

Before opening a PR, ensure:

```bash
cd www && npm run build
```

## Branch and pull requests

1. Fork the repository and create a branch from `main` (e.g. `fix/parser-edge-case`, `feat/new-component`).
2. Keep changes focused — one logical change per PR when possible.
3. Update tests when behavior changes.
4. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]` for user-visible changes (English, Keep a Changelog categories).
5. Open a PR against `main` with a clear description and steps to verify.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) in **English**:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — tooling, deps, release prep
- `test:` — tests only
- `refactor:` — code change without feature/fix

Examples:

```
feat: add ManoTabs component
fix: handle nested blockquotes in parser
docs: document thumbnail frontmatter field
refactor: extract asset loading to separate module
```

## What **not** to publish

These stay in the repo (GitHub) but are excluded from the npm tarball:

| Path / file       | Reason                                  |
| ----------------- | --------------------------------------- |
| `www/`            | Demo site only                          |
| `docs/`           | API documentation for contributors      |
| `CONTRIBUTING.md` | Contributor guide (this file)           |
| `SECURITY.md`     | Security policy for the GitHub repo     |
| Config files      | Build/test tooling                      |

Only paths listed in `"files"` in `package.json` (plus `README.md`, `LICENSE`, `package.json`) ship to npm.

## Releases

1. Bump `version` in `package.json` and add `## [x.y.z]` to `CHANGELOG.md`.
2. `git commit -m "chore: release vX.Y.Z"`.
3. `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
4. `npm publish` (same version as the tag; enable npm 2FA for publish).
5. `git push origin main` and `git push origin vX.Y.Z`.
6. Create a GitHub Release from the tag (stable releases: label **None**; copy notes from `CHANGELOG.md`).

## Questions

Open a [GitHub issue](https://github.com/whosramoss/manodx/issues) for bugs or feature discussions before large refactors.
