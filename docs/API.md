# Manodx Framework API

A lightweight Markdown/MDX framework for building static sites with component support.

## Architecture Overview

The framework follows a pipeline architecture:

```
Markdown Text → Parser → AST → Renderer → HTML
```

### Core Flow

1. **Content Loading**: Raw markdown files are loaded from a content directory
2. **Front Matter Extraction**: YAML-style metadata is parsed from file headers
3. **Markdown Parsing**: Text is converted to an Abstract Syntax Tree (AST)
4. **HTML Rendering**: AST nodes are transformed into HTML with component support
5. **Site Assembly**: Documents are registered and routed for navigation

## Module Structure

```
src/
├── assets/         # Framework default assets (favicons, thumbnail)
├── core/           # Parsing and rendering engine
│   ├── ast.ts      # AST node type definitions
│   ├── inline.ts   # Inline element parser
│   ├── parser.ts   # Block-level markdown parser
│   ├── frontmatter.ts  # YAML front matter parser
│   └── renderer.ts # AST to HTML renderer
├── content/        # Document management
│   ├── document.ts # Document interface
│   └── registry.ts # Document storage and lookup
├── router/         # URL and path handling
│   └── file-router.ts  # File path to route conversion
├── config/         # Configuration and components
│   ├── types.ts    # Config type definitions
│   ├── components.ts   # Built-in MDX components
│   ├── style.css   # Framework styles and theme
│   └── app.ts      # Host application class
├── site/           # Framework facade
│   └── manodx-site.ts  # Main API entry point
├── loader/         # File system utilities
│   ├── asset-loader.ts     # Asset resolution and copying
│   ├── content-loader.ts   # Directory traversal
│   └── ts-compiler.ts      # TypeScript transpilation
├── server/         # Development servers
│   ├── dev-server.ts   # Dev server with HMR
│   ├── preview-server.ts   # Production preview
│   └── html-shell.ts   # HTML template generator
├── runtime/        # Browser runtime
│   ├── bootstrap.ts    # Browser initialization
│   └── framework-bundle.ts # Framework exports
├── build/          # Static site generation
│   └── static-builder.ts   # Production build
└── cli/            # Command line interface
    ├── index.ts    # CLI entry point
    └── init.ts     # Project scaffolding
```

## Core Module

### AST (`src/core/ast.ts`)

Defines the Abstract Syntax Tree node types used throughout the framework.

#### Types

**`TableAlign`**: `'left' | 'center' | 'right' | null`

Alignment for table columns.

**`InlineNode`**: Union type for inline elements:

- `text`: Plain text content
- `strong`: Bold text (`**text**`)
- `emphasis`: Italic text (`*text*` or `_text_`)
- `code`: Inline code (`` `code` ``)
- `link`: Hyperlink (`[label](url)`)
- `image`: Image (`![alt](url)`)

**`BlockNode`**: Union type for block elements:

- `heading`: Headers h1-h6 with depth and inline children
- `paragraph`: Text paragraph with inline children
- `list`: Ordered/unordered list with items
- `table`: GFM-style table with header, rows, and alignment
- `code`: Fenced code block with optional language
- `blockquote`: Quoted content with nested blocks
- `thematicBreak`: Horizontal rule (`---`)
- `component`: MDX component with name, props, and children

**`ListItem`**: Contains `children: BlockNode[]`

**`Root`**: Top-level node containing `children: BlockNode[]`

### Inline Parser (`src/core/inline.ts`)

Parses inline Markdown syntax into `InlineNode[]`.

#### Class: `InlineParser`

```typescript
class InlineParser {
  parse(input: string): InlineNode[];
}
```

**Supported syntax:**

- Inline code: `` `code` ``
- Images: `![alt](url)`
- Links: `[label](url)`
- Strong: `**text**`
- Emphasis: `*text*` or `_text_`

The parser processes input character by character, detecting markers and recursively parsing nested content.

### Block Parser (`src/core/parser.ts`)

Parses block-level Markdown into a complete AST.

#### Class: `MarkdownParser`

```typescript
class MarkdownParser {
  parse(input: string): Root;
  parseInline(input: string): InlineNode[];
}
```

**Supported block elements:**

- Headings: `# H1` through `###### H6`
- Paragraphs: Plain text blocks
- Lists: `- item`, `* item`, `+ item`, `1. item`, `1) item`
- Tables: GFM pipe tables with alignment
- Code blocks: Fenced with ` ``` ` or `~~~`
- Blockquotes: `> quoted text`
- Thematic breaks: `---`, `***`, `___`
- MDX components: `<Component prop="value" />` or `<Component>...</Component>`

**Parsing strategy:**

- Lines are processed sequentially
- Each line is tested against patterns in priority order
- Nested structures (lists, blockquotes) are parsed recursively
- Component blocks scan for matching close tags

### Front Matter Parser (`src/core/frontmatter.ts`)

Extracts YAML-style metadata from document headers.

#### Type: `FrontMatterData`

```typescript
type FrontMatterData = Record<string, string>;
```

#### Class: `FrontMatterParser`

```typescript
class FrontMatterParser {
  parse(raw: string): { data: FrontMatterData; content: string };
}
```

**Format:**

```markdown
---
title: Document Title
description: A brief description
---

Content starts here...
```

Only simple `key: value` pairs are supported. Values can be quoted or unquoted.

**Supported frontmatter fields:**

| Field | Description |
|-------|-------------|
| `type` | Document type: `"home"` (root page, no back button) or `"page"` (default) |
| `title` | Page title (falls back to first heading or filename) |
| `description` | Page description shown in header and used for ManoCard meta |
| `thumbnail` | Image path for hero header (shows centered logo + title) |
| `badge` | Text shown in a badge pill in the header |
| `showSwitchButtonTheme` | If `"true"`, shows light/dark theme switch in header |
| `tag` | Tag label shown on ManoCard when this document is linked |

### HTML Renderer (`src/core/renderer.ts`)

Transforms AST nodes into HTML strings.

#### Type: `ComponentRenderer`

```typescript
type ComponentRenderer = (
  props: Record<string, string>,
  children: string,
) => string;
```

Function that receives component props and pre-rendered inner HTML, returning the final HTML.

#### Interface: `RenderOptions`

```typescript
interface RenderOptions {
  components?: Record<string, ComponentRenderer>;
}
```

#### Function: `escapeHtml`

```typescript
function escapeHtml(text: string): string;
```

Escapes `&`, `<`, `>`, and `"` for safe HTML insertion.

#### Class: `HtmlRenderer`

```typescript
class HtmlRenderer {
  render(root: Root, options?: RenderOptions): string;
}
```

**Output classes:**

- Headings: `m-h1` through `m-h6`
- Thematic break: `m-hr`
- Code blocks: `m-pre`, with `language-{lang}` on `<code>`
- Blockquotes: `m-quote`
- Lists: `m-list`
- Tables: `m-table`
- Links: `m-link`
- Images: `m-image`

Unknown components render a visible placeholder with class `m-component-missing`.

## Content Module

### Document (`src/content/document.ts`)

Represents a single parsed content file.

#### Interface: `Document`

```typescript
interface Document {
  file: string; // Path relative to content root (e.g., "posts/hello.md")
  route: string; // URL route (e.g., "/posts/hello")
  modulePath: string; // Original path from content glob
  raw: string; // Original file text including front matter
  meta: FrontMatterData; // Parsed front matter values
  content: string; // Markdown body without front matter
  ast: Root; // Parsed AST
  type: string; // Document type from meta, defaults to "page"
  title: string; // Title from meta, first heading, or filename
}
```

### Document Registry (`src/content/registry.ts`)

Stores and retrieves parsed documents.

#### Class: `DocumentRegistry`

```typescript
class DocumentRegistry {
  constructor(
    frontMatter: FrontMatterParser,
    parser: MarkdownParser,
    router: FileRouter,
  );

  load(modules: Record<string, string>): void;
  get(file: string): Document | undefined;
  getByRoute(route: string): Document | undefined;
  has(file: string): boolean;
  all(): Document[];
}
```

The `load` method accepts a map of `modulePath -> rawContent` and processes each file through the front matter parser and markdown parser.

## Router Module

### File Router (`src/router/file-router.ts`)

Handles path normalization and resolution between documents.

#### Class: `FileRouter`

```typescript
class FileRouter {
  constructor(contentMarker: string, indexFile: string);

  toContentPath(modulePath: string): string;
  toRoute(contentPath: string): string;
  dirname(filePath: string): string;
  join(dir: string, file: string): string;
  resolve(fromFile: string, ref: string): string;
  parent(file: string, has: (path: string) => boolean): string;
}
```

**Path conversion examples:**

- `toContentPath("/app/posts/hello.md")` → `"posts/hello.md"`
- `toRoute("posts/hello.md")` → `"/posts/hello"`
- `toRoute("main.md")` → `"/"`
- `toRoute("docs/index.md")` → `"/docs"`

**Reference resolution:**

- `resolve("docs/guide.md", "intro.md")` → `"docs/intro.md"`
- `resolve("docs/guide.md", "other/page.md")` → `"other/page.md"`

**Parent navigation:**

- Returns the section's `main.md` if it exists
- Falls back to the root index file

## Site Module

### ManodxSite (`src/site/manodx-site.ts`)

Main framework facade that wires all components together.

#### Interface: `SiteOptions`

```typescript
interface SiteOptions {
  modules: Record<string, string>; // Content glob: modulePath -> raw markdown
  contentMarker?: string; // Marker in paths for content root
  indexFile?: string; // Home document path
  components?: Record<string, ComponentRenderer>; // Base components
}
```

#### Class: `ManodxSite`

```typescript
class ManodxSite {
  readonly registry: DocumentRegistry;
  readonly router: FileRouter;
  readonly indexFile: string;

  constructor(options: SiteOptions);

  get(file: string): Document | undefined;
  renderDocument(
    doc: Document,
    components?: Record<string, ComponentRenderer>,
  ): string;
  renderMarkdown(
    markdown: string,
    components?: Record<string, ComponentRenderer>,
  ): string;
  parentOf(file: string): string;
}
```

**Usage:**

```typescript
const site = new ManodxSite({
  modules: { "/app/main.md": "# Hello" },
  components: { ManoBadge: (props) => `<span>${props.label}</span>` },
});

const doc = site.get("main.md");
const html = site.renderDocument(doc);
```

## Config Module

### Types (`src/config/types.ts`)

#### Interface: `ManodxConfig`

```typescript
interface ManodxConfig {
  title: string; // Site title
  description: string; // Site description
  contentDir: string; // Content directory name
  contentMarker: string; // Path marker for content root
  indexFile: string; // Home document filename
  components: Record<string, ComponentRenderer>;
}
```

#### Constant: `defaultConfig`

```typescript
const defaultConfig: ManodxConfig = {
  title: "manodx",
  description: "Websites rendered by the manodx framework",
  contentDir: "app",
  contentMarker: "/app/",
  indexFile: "main.md",
  components: {},
};
```

### Components (`src/config/components.ts`)

Built-in MDX-style components.

#### Component: `ManoCallout`

A styled callout box with type variants.

```markdown
<ManoCallout label="tip" title="Pro Tip">
Content here
</ManoCallout>
```

Labels: `tip`, `warning`, `note`, etc. Renders with class `callout callout--{label}`.

#### Component: `ManoBadge`

Inline pill/badge element.

```markdown
<ManoBadge label="New" />
```

Renders with class `badge`.

#### Component: `ManoWarning`

Centered warning/notice strip. Inner Markdown is allowed.

```markdown
<ManoWarning>
Content framework focused on Markdown
</ManoWarning>
```

Renders with class `warning-strip`.

#### Function: `createManoCard`

```typescript
function createManoCard(site: ManodxSite, fromFile: string): ComponentRenderer;
```

Creates a `ManoCard` navigation card bound to a document for relative path resolution.

```markdown
<ManoCard file="roadmap.md" />
```

Renders a button with `data-mano-file` attribute for click handling.

### Site App (`src/config/app.ts`)

Host application that uses the framework to render documents and handle navigation.

#### Class: `SiteApp`

```typescript
class SiteApp {
  constructor(
    root: HTMLElement,
    modules: Record<string, string>,
    config: ManodxConfig,
  );

  start(): void;
  open(file: string): void;
}
```

**Layout modes:**

- `home-mode`: Root document (`type: home` or the index file). Header from frontmatter, no back button
- `page-mode`: Nested document. Header from frontmatter, back button, `.page-content` (max-width 48rem)

**Navigation:**

- ManoCard clicks trigger `open()` via `data-mano-file` attribute
- Back button navigates to parent document
- Navigation is single-flighted (concurrent calls are ignored while transitioning)

**Page transitions:**

- Fade-out (160ms) when leaving a page
- Fade-in (220ms) when entering a page
- Uses Web Animations API (`element.animate`)
- Respects `prefers-reduced-motion: reduce` (skips animation)

**Theme support:**

- Light/dark mode via `html.dark` class
- Persisted in `localStorage` under key `"theme"`
- Optional theme switch button (frontmatter: `showSwitchButtonTheme: true`)
- Switch state: ON = light, OFF = dark

## Loader Module

### Asset Loader (`src/loader/asset-loader.ts`)

Handles resolution and copying of framework and site assets (favicons, images).

#### Constant: `ASSETS_DIR`

```typescript
const ASSETS_DIR = "assets";
```

The standard directory name for assets.

#### Function: `frameworkAssetsDir`

```typescript
function frameworkAssetsDir(packageRoot: string): string;
```

Returns the path to the framework's built-in assets (`src/assets`).

#### Function: `siteAssetsDir`

```typescript
function siteAssetsDir(root: string): string;
```

Returns the path to the site's assets directory (`<root>/assets`).

#### Function: `resolveAsset`

```typescript
function resolveAsset(dir: string, assetPath: string): string | null;
```

Resolves an asset path against a directory. Returns the full path if the file exists, or `null` otherwise. Prevents directory traversal attacks.

#### Function: `copyAssets`

```typescript
function copyAssets(sourceDir: string, targetDir: string): string[];
```

Recursively copies all files from source to target directory. Returns an array of copied file names. Site assets are copied after framework assets, allowing overrides.

### Content Loader (`src/loader/content-loader.ts`)

File system utilities for loading content.

#### Function: `loadContentDir`

```typescript
function loadContentDir(dir: string): Record<string, string>;
```

Recursively reads all `.md` files from a directory. Returns a map of relative paths to file contents.

#### Function: `loadContentForRegistry`

```typescript
function loadContentForRegistry(
  dir: string,
  contentMarker?: string,
): Record<string, string>;
```

Loads content with keys prefixed by the content marker for route resolution.

### TypeScript Compiler (`src/loader/ts-compiler.ts`)

TypeScript transpilation utilities for browser compatibility.

#### Function: `transpileModule`

```typescript
function transpileModule(code: string, filename: string): string;
```

Transpiles TypeScript to JavaScript using ESNext modules and ES2022 target.

#### Function: `transpileFile`

```typescript
function transpileFile(filePath: string): string;
```

Reads and transpiles a TypeScript file.

#### Function: `rewriteImports`

```typescript
function rewriteImports(
  code: string,
  options?: { packageName?: string; packagePath?: string },
): string;
```

Rewrites import paths for browser compatibility:

- Package imports → internal framework path
- Removes `.ts` extensions from relative imports
- Strips CSS imports (loaded separately)

#### Function: `transpileForBrowser`

```typescript
function transpileForBrowser(
  code: string,
  filename: string,
  options?: { packageName?: string; packagePath?: string },
): string;
```

Combines transpilation and import rewriting.

## Server Module

### Dev Server (`src/server/dev-server.ts`)

Development server with hot reload.

#### Interface: `DevServerOptions`

```typescript
interface DevServerOptions {
  root: string;
  port?: number; // Default: 4554
  configPath?: string; // Default: 'manodx.config.ts'
}
```

#### Function: `startDevServer`

```typescript
function startDevServer(options: DevServerOptions): void;
```

**Endpoints:**

- `/` - HTML shell
- `/__manodx/events` - SSE for live reload
- `/__manodx/content.json` - Content as JSON
- `/__manodx/config.js` - Config as ES module
- `/__manodx/style.css` - Framework styles
- `/__manodx/runtime.js` - Bootstrap script
- `/__manodx/framework.js` - Bundled framework
- `/assets/*` - Static assets (site first, framework fallback)

**Features:**

- File watching with automatic reload
- On-the-fly TypeScript transpilation
- Framework bundling without external bundler
- Asset serving with site override capability (site assets take precedence over framework defaults)

### Preview Server (`src/server/preview-server.ts`)

Serves the production build for testing.

#### Interface: `PreviewServerOptions`

```typescript
interface PreviewServerOptions {
  distDir: string;
  port?: number; // Default: 4173
}
```

#### Function: `startPreviewServer`

```typescript
function startPreviewServer(options: PreviewServerOptions): void;
```

Serves static files from the dist directory with SPA fallback to `index.html`.

### HTML Shell (`src/server/html-shell.ts`)

Generates the HTML template with all necessary meta tags, icons, and scripts.

#### Interface: `HtmlShellOptions`

```typescript
interface HtmlShellOptions {
  config: ManodxConfig;
  fonts?: string[];
  liveReload?: boolean;
  /** Where the framework/site assets are published (default: "/assets") */
  assetsBase?: string;
  /** CSS stylesheet href (default: "/__manodx/style.css") */
  cssHref?: string;
  /** Runtime script src (default: "/__manodx/runtime.js") */
  runtimeSrc?: string;
}
```

#### Function: `generateHtmlShell`

```typescript
function generateHtmlShell(options: HtmlShellOptions): string;
```

Generates HTML with:

- Meta tags for SEO (`description`, `color-scheme`)
- Open Graph and Twitter Card meta tags (`og:title`, `og:description`, `og:image`, `twitter:card`)
- Favicon links (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `android-chrome-*`, `apple-touch-icon`)
- Font preconnect and loading
- Style and script links (customizable via `cssHref` and `runtimeSrc`)
- Live reload script (dev only)

## Runtime Module

### Bootstrap (`src/runtime/bootstrap.ts`)

Browser initialization script served as `/__manodx/runtime.js`.

**Boot sequence:**

1. Load site config from `/__manodx/config.js`
2. Fetch content from `/__manodx/content.json`
3. Transform content keys with content marker
4. Import framework from `/__manodx/framework.js`
5. Create and start `SiteApp`

### Framework Bundle (`src/runtime/framework-bundle.ts`)

Re-exports framework components for browser runtime.

**Exports:**

- `SiteApp`
- `baseComponents`
- `createManoCard`
- `ManodxSite`
- `defaultConfig`

## Build Module

### Static Builder (`src/build/static-builder.ts`)

Production build generator.

#### Interface: `BuildOptions`

```typescript
interface BuildOptions {
  root: string;
  outDir?: string; // Default: 'dist'
  configPath?: string; // Default: 'manodx.config.ts'
}
```

#### Function: `build`

```typescript
async function build(options: BuildOptions): Promise<void>;
```

**Build process:**

1. Clean output directory
2. Load and parse config
3. Load all content files
4. Bundle framework code
5. Generate runtime with inlined content and config
6. Copy and hash CSS
7. Copy framework assets (favicons, thumbnail)
8. Copy site assets (can override framework assets)
9. Generate HTML with hashed asset references

**Output structure:**

```
dist/
├── index.html
└── assets/
    ├── framework.{hash}.js
    ├── runtime.{hash}.js
    ├── style.{hash}.css
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    ├── apple-touch-icon.png
    ├── thumbnail.png
    └── (site assets, e.g., logo.svg)
```

## CLI Module

### Commands (`src/cli/index.ts`)

Command-line interface for the framework.

**Usage:**

```bash
manodx <command> [options]
```

**Commands:**

- `init <name>` - Create a new manodx project with example files
- `dev` - Start development server with hot reload
- `build` - Build static site for production
- `preview` - Preview the production build locally

**Options:**

- `-p, --port <port>` - Port for dev/preview server
- `-o, --outDir <dir>` - Output directory for build
- `-h, --help` - Show help message

**Default ports:**

- Dev server: 4554
- Preview server: 4173

### Project Initialization (`src/cli/init.ts`)

Creates a new manodx project with starter files.

#### Function: `init`

```typescript
async function init(options: InitOptions): Promise<void>;
```

#### Interface: `InitOptions`

```typescript
interface InitOptions {
  name: string;      // Project name
  targetDir: string; // Absolute path to create project in
}
```

**Generated files:**

```
<project-name>/
├── app/
│   └── main.md          # Home page with example content
├── assets/              # Empty directory for site assets
├── manodx.config.ts     # Site configuration
├── package.json         # npm scripts (dev, build, preview)
└── .gitignore           # node_modules, dist
```

## Public API Exports (`src/index.ts`)

```typescript
export type {
  BlockNode,
  InlineNode,
  ListItem,
  Root,
  TableAlign,
} from "./core/ast";
export { InlineParser } from "./core/inline";
export { MarkdownParser } from "./core/parser";
export { FrontMatterParser, type FrontMatterData } from "./core/frontmatter";
export {
  HtmlRenderer,
  escapeHtml,
  type ComponentRenderer,
  type RenderOptions,
} from "./core/renderer";
export { FileRouter } from "./router/file-router";
export type { Document } from "./content/document";
export { DocumentRegistry } from "./content/registry";
export { ManodxSite, type SiteOptions } from "./site/manodx-site";
export { type ManodxConfig, defaultConfig } from "./config/types";
export { SiteApp } from "./config/app";
export { baseComponents, createManoCard } from "./config/components";
```
