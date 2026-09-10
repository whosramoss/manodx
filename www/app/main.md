---
title: Manodx
description: Markdown As Native Output
thumbnail: ./assets/logo.svg
badge: Hello
showSwitchButtonTheme: true
---

<ManoWarning>
The `.md` file is the application, not an attachment to it.
</ManoWarning>

**MANODX** (_Markdown As Native Output_) is a web framework that turns Markdown and MDX into pages. Markdown is no longer just documentation: it is the substrate of the app. A single parse-and-render pipeline converts that content into a site with little sitting between the file and the HTML.

There is no `remark`, `unified`, or `markdown-it`. The parser, front matter, renderer, and file router are TypeScript written for this flow. The result is an in-memory document graph, routes derived from paths, and HTML from the AST, a small client bundle and a straightforward static build.

## What the pipeline does

1. Read each `.md` file as text
2. Split the `---` front-matter block from the body
3. Parse Markdown into an AST (blocks, then inline)
4. Resolve `Mano*` tags in the component registry
5. Render HTML and wire file-based navigation

The router treats `main.md` as the root. Folders become sections; a `<ManoCard file="…">` opens another document without leaving the app. `type: home` only means there is no parent page, the back button does not exist at the root.

## What you write

The body accepts ordinary Markdown (headings, nested lists, GFM tables, fences, quotes, emphasis, links) and MDX-style components (`<ManoCallout>`, `<ManoBadge>`, `<ManoWarning>`, `<ManoCard>`). Front-matter fields feed the header: `title`, `description`, `thumbnail`, `badge`, `tag`, `showSwitchButtonTheme`.

<ManoCallout label="tip" title="One source">
The file you edit is the file the parser sees. There is no second template for “the real page”.
</ManoCallout>

## Study material

Reference pages for the three surfaces you actually touch: the Markdown grammar, the `---` fields, and the `Mano*` tags. Each one is a live document, the examples on those pages are parsed by the same pipeline as this home file.

<ManoCard file="markdown_cases.md" />
<ManoCard file="manodx_frontmatter.md" />
<ManoCard file="manodx_components.md" />

## Examples

A full article that mixes every construct from the guides above (headings, tables, fences, callouts, badges) and opens a second sheet with `<ManoCard>`. Use it as a template for your own content, not as API reference.

<ManoCard file="example/main.md" />
