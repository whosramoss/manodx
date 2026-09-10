---
type: page
title: Manodx Front matter
description: Fields manodx reads from the YAML block at the top of each Markdown file
tag: manodx
---

Every `.md` file can start with a `---` block. manodx reads only `key: value` pairs, no nested YAML, lists, or booleans. Quotes around values are optional.

This page’s own header (title, description, tag on cards) comes from the block above.

```md
---
type: page
title: Front matter
description: Fields manodx reads from the YAML block
tag: manodx
---
```

| Field                   | Required | Used for                             |
| :---------------------- | :------: | :----------------------------------- |
| `type`                  |    no    | Root vs inner page (back button)     |
| `title`                 |    no    | Header and `<ManoCard>` title        |
| `description`           |    no    | Header subtitle and card meta        |
| `thumbnail`             |    no    | Logo above the title; centers header |
| `badge`                 |    no    | Small pill in the header             |
| `showSwitchButtonTheme` |    no    | Light/dark switch next to the badge  |
| `tag`                   |    no    | Label on `<ManoCard>`                |

Unknown keys are kept in `doc.meta` but the default app ignores them.

---

## type

Tells the app if the file is the **site root**.

- `page` (default) — inner document. Shows the back button.
- `home` — root. No back button, because there is no parent file.

The index file (`main.md` by default) is also treated as home even without `type: home`.

**Use `home`** on the landing file. **Use `page`** (or omit) on everything else.

```md
---
type: home
title: Manodx
---
```

---

## title

Text of the page `<h1>` and of any `<ManoCard>` that points to this file.

If omitted, manodx uses the first `# heading` in the body, then the file name.

**Use it** whenever the card or header should not depend on a heading inside the Markdown.

```md
---
title: Markdown Cases
---
```

---

## description

Subtitle under the header and the second line of `<ManoCard>`.

If omitted, the header has no subtitle. A card without description falls back to the file path.

**Use it** as a one-line summary for lists and for the page header.

```md
---
description: Each Markdown scenario the parser supports
---
```

---

## thumbnail

Path or URL of an image (`./assets/logo.svg`, `/logo.svg`, `https://…`).

When it is set, the header shows the image (128px) above the title, and both title and description are centered.

**Use it** on the home page (or any page) that should look like a project README. Omit it for a normal left-aligned header.

```md
---
title: Manodx
description: Markdown content site
thumbnail: ./assets/logo.svg
---
```

---

## badge

Short pill in the header, next to the theme switch when both are present.

**Use it** for a product name, version, or status (`Demo`, `v1`, `WIP`). Omit it if the header should stay title-only.

```md
---
badge: Hello
---
```

---

## showSwitchButtonTheme

Must be the string `true` (not a YAML boolean). Renders the light/dark switch on the right of the badge row.

**Use it** on the home page so visitors can toggle theme. The choice is stored in `localStorage`. Omit it on inner pages unless they should also show the switch.

```md
---
showSwitchButtonTheme: true
---
```

---

## tag

Label drawn on `<ManoCard>` for this file (`Material`, `MDX`, `manodx`). It does not change layout.

**Use it** to classify cards on the home list. Omit it for a card with only title and description.

```md
---
tag: MDX
---
```

---

## Putting it together

Home (root, logo, switch):

```md
---
type: home
title: Manodx
description: Markdown content site rendered by the manodx framework
thumbnail: ./assets/logo.svg
badge: Hello
showSwitchButtonTheme: true
---
```

Inner page (back button, card label):

```md
---
type: page
title: Front matter
description: Fields manodx reads from the YAML block
tag: manodx
---
```
