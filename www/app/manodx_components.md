---
type: page
title: Manodx Components
description: MDX-style tags you can drop into Markdown, and when to use each one
tag: manodx
---

manodx treats tags that start with an uppercase letter as **components**. They are not HTML: the parser turns `<ManoCard … />` into a node, looks up a renderer by name, and injects HTML.

Built-in names all use the `Mano` prefix so they do not clash with your own tags.

| Component       | Form         | Role                              |
| :-------------- | :----------- | :-------------------------------- |
| `<ManoCard>`    | self-closing | Navigate to another `.md` file    |
| `<ManoCallout>` | block        | Highlight a tip, warning, or note |
| `<ManoBadge>`   | self-closing | Inline status pill                |
| `<ManoWarning>` | block        | Full-width notice strip           |

A name the app does not know renders a visible **Unknown component** placeholder (`m-component-missing`), so a typo is obvious while you write.

---

## Syntax

The opening tag must sit on its **own line**. Names match `/^[A-Z][A-Za-z0-9]*$/`. Props are `key="value"` (double quotes).

**Self-closing** — no children:

```md
<ManoBadge label="new" />
```

**Block** — inner Markdown is parsed as usual (paragraphs, lists, links, even other components):

```md
<ManoCallout label="tip">
You can use `code` and [links](https://example.com).
</ManoCallout>
```

The closing tag must be `</Name>` on its own line, with the same name.

Register extra renderers in `manodx.config.ts` (`config.components`) or pass them into `ManodxSite`. `ManoCard` is bound per page by `createManoCard`, so relative `file` paths resolve from the current document.

---

## <ManoCard>

A tappable card that opens another content file. Use it on the home list (or any page) instead of a raw Markdown link when the target should look like a document entry.

**Prop**

| Prop   | Required | Meaning              |
| :----- | :------: | :------------------- |
| `file` |   yes    | Path to a `.md` file |

Resolution:

- `file="notes.md"` in the same folder → `notes.md` next to the current file
- `file="example_routes/callouts.md"` → path from the content root (the string contains `/`)

The card reads the **target** front matter:

- title → card title (`title`, else first `# heading`, else the path)
- description → card meta line
- tag → small label on the card

**Use it** for indexes and section hubs. Do not use it for in-prose references; a `[link](…)` is enough there.

```md
<ManoCard file="manodx_frontmatter.md" />
```

<ManoCard file="manodx_frontmatter.md" />

Clicks set `data-mano-file` and the app calls `open()` on that file.

---

## <ManoCallout>

A labeled box for asides. The body is Markdown, so lists and emphasis work inside it.

**Props**

| Prop    | Required | Meaning                                      |
| :------ | :------: | :------------------------------------------- |
| `label` |    no    | Variant and default heading. Default: `note` |
| `title` |    no    | Heading text. Default: `label` in uppercase  |

`label` is lowercased and becomes the CSS modifier `callout--{label}`. Built-in styles:

- `tip` — success-tinted left border
- `warning` — error-tinted left border
- any other value (including `note`) — orange wash, same as the default callout

**Use `tip`** for how-tos and extra context. **Use `warning`** for pitfalls and breaking changes. **Use `title`** when the heading should not be `TIP` / `WARNING` (for example `title="Pro tip"`).

```md
<ManoCallout label="tip">
**Tip:** content inside the component is also Markdown.
</ManoCallout>
```

<ManoCallout label="tip">
**Tip:** content inside the component is also Markdown.
</ManoCallout>

```md
<ManoCallout label="warning" title="Watch out">
Unknown component names show a visible notice instead of failing silently.
</ManoCallout>
```

<ManoCallout label="warning" title="Watch out">
Unknown component names show a visible notice instead of failing silently.
</ManoCallout>

---

## <ManoBadge>

A compact pill for a short token (version, status, category). It is **inline** in the Markdown sense of “one tag, no body”, but it still occupies its own line in the source.

**Prop**

| Prop    | Required | Meaning              |
| :------ | :------: | :------------------- |
| `label` |   yes    | Text inside the pill |

**Use it** next to a heading or in a list of flags. For a page-level chip in the site header, use front matter `badge` instead, that is not this component.

```md
<ManoBadge label="new" />
<ManoBadge label="stable" />
```

<ManoBadge label="new" />

<ManoBadge label="stable" />

---

## <ManoWarning>

A centered strip with the orange wash (same surface as the home notice). It has **no props**; everything goes in the body as Markdown.

**Use it** for a single, page-wide message: a one-liner about the project, a deprecation, a short disclaimer. Prefer `<ManoCallout>` when you need a title and a variant (`tip` / `warning`). Prefer `<ManoWarning>` when the text should sit like a banner, not a boxed aside.

```md
<ManoWarning>
Content framework focused on Markdown
</ManoWarning>
```

<ManoWarning>
Content framework focused on Markdown
</ManoWarning>

---

## Unknown names

If the tag is not registered, manodx still parses it and prints a placeholder. That is intentional: a missing renderer should not swallow the content.

```md
<ManoDoesNotExist />
```

<ManoDoesNotExist />

---

## Choosing one

| Need                                  | Component                                                        |
| :------------------------------------ | :--------------------------------------------------------------- |
| Go to another document                | `<ManoCard file="…">`                                            |
| Call out a tip or risk in the article | `<ManoCallout>`                                                  |
| Tiny status word                      | `<ManoBadge>`                                                    |
| Banner across the page                | `<ManoWarning>`                                                  |
| Header chip / theme switch            | front matter (`badge`, `showSwitchButtonTheme`), not a component |
