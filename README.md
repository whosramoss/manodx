<h1>
  <p align="center">
    <img src="https://manodx.whosramoss.com/assets/android-chrome-512x512.png" alt="logo" width="128">
    <br>manodx
  </p>
</h1>

<p align="center">
  <b>MANODX</b> (<i>Markdown As Native Output</i>) is a web framework that turns Markdown and MDX into pages.
  <br /> <br />
  <a href="#how-to-install">Install</a>
  ·
  <a href="#usage">Usage</a>
  ·
  <a href="#features">Features</a>
</p>

<p align="center">
  <a href="https://manodx.whosramoss.com">Live demo</a>
</p>

---

## How to Install

```bash
npx manodx init my-site
cd my-site
npm install
npm run dev
```

Open `http://localhost:4554` to see your site.

## Usage

### Project structure

```
my-site/
├── app/
│   └── main.md          # Home page
├── assets/              # Your images, logos, etc.
├── manodx.config.ts     # Site configuration
└── package.json
```

### Commands

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server with hot reload |
| `npm run build`   | Generate static site in `dist/`  |
| `npm run preview` | Preview the production build     |

### Adding pages

Create `.md` files in the `app/` directory:

```
app/
├── main.md          # / (home)
├── about.md         # /about
└── docs/
    ├── main.md      # /docs
    └── guide.md     # /docs/guide
```

### Configuration

```typescript
// manodx.config.ts
import { type ManodxConfig, defaultConfig } from "manodx";

export default {
  ...defaultConfig,
  title: "My Site",
  description: "Built with manodx",
};
```

## Features

- **Custom Markdown parser** — No external dependencies (remark, unified, etc.)
- **MDX components** — Use `<ManoCallout>`, `<ManoBadge>`, `<ManoCard>`, `<ManoWarning>` or create your own
- **File-based routing** — `app/docs/guide.md` becomes `/docs/guide`
- **Frontmatter support** — Title, description, thumbnail, badge, theme switch
- **Light/dark theme** — Built-in toggle with localStorage persistence
- **Page transitions** — Smooth fade animations (respects reduced motion)
- **Zero-config assets** — Favicons and OG images included by default
- **Dev server** — Hot reload with SSE
- **Static builder** — Hashed assets for production
