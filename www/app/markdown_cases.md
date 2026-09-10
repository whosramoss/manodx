---
type: page
title: Markdown Cases
description: Each Markdown scenario the parser supports, source and live render
tag: markdown
---

# Cases

Each block below is the source, then the same syntax rendered by manodx.

## Heading

```md
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

## Unordered list

```md
- Parser
- Renderer
  - Inline
  - Blocks
- Router
```

- Parser
- Renderer
  - Inline
  - Blocks
- Router

---

## Ordered list

```md
1. Read the file
2. Extract front matter
3. Parse the AST
   1. Blocks
   2. Inline
4. Render HTML
```

1. Read the file
2. Extract front matter
3. Parse the AST
   1. Blocks
   2. Inline
4. Render HTML

---

## Table

```md
| Day |  Topic   | Load |
| :-- | :------: | ---: |
| Mon |  Parser  |   2h |
| Tue | Renderer |   2h |
| Wed |  Router  |   1h |
```

| Day |  Topic   | Load |
| :-- | :------: | ---: |
| Mon |  Parser  |   2h |
| Tue | Renderer |   2h |
| Wed |  Router  |   1h |

Left, center, and right alignment come from `:` in the separator row.

---

## Fenced code

```ts
import { ManodxSite } from "manodx";
const site = new ManodxSite({ modules });
const home = site.get("main.md");
```

---

## Blockquote

```md
> Tip: the parser has no external library dependencies.
> All of the logic lives in `src/core`.
```

> Tip: the parser has no external library dependencies.
> All of the logic lives in `src/core`.

---

## Thematic break

```md
---
```

A rule is rendered between this sentence and the next.

---

And this paragraph sits below it.

---

## Inline

```md
Use `inline code`, **bold**, _italic_, and [a link](https://example.com).
```

Use `inline code`, **bold**, _italic_, and [a link](https://example.com).
