# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

Security fixes are released as patch versions (e.g. `1.0.1`) when applicable.

## Reporting a vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

1. Use [GitHub Security Advisories](https://github.com/whosramoss/manodx/security/advisories/new) (preferred), or contact the maintainer privately via GitHub.
2. Include: affected version, steps to reproduce, and impact (e.g. code execution, data exposure).
3. Avoid posting exploit details, payloads, or live attack demos in public channels until a fix is available.

We aim to acknowledge reports within a reasonable timeframe and coordinate disclosure after a fix or mitigation is ready.

## Scope

| In scope                                                              | Out of scope                                                                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| The `manodx` library code shipped in the npm package                  | Sites built with manodx (hosting, CDN, user content)                                    |
| Documented public API in [docs/API.md](./docs/API.md)                 | Applications that depend on `manodx` (consumer sites, deployment pipelines)             |
| Markdown/MDX parsing and HTML rendering pipeline                      | Social engineering, npm account compromise, misconfigured environments in consumer apps |
| Built-in components (`ManoCallout`, `ManoBadge`, `ManoCard`, etc.)    | Third-party components added by consumers                                               |
| Dev server and static builder                                         | The demo site under `www/` (example content only)                                       |

## Security considerations

`manodx` parses Markdown/MDX content and renders it to HTML. Key security aspects:

- **HTML escaping**: All user-provided text is escaped via `escapeHtml()` before rendering to prevent XSS.
- **Component props**: Props passed to MDX components are escaped before insertion into HTML attributes.
- **File system access**: The dev server and builder only read files from the configured content directory. Path traversal attempts are blocked in asset resolution.
- **No network requests**: The framework does not make outbound network requests. External resources (fonts, images) are loaded by the browser based on the generated HTML.

Reports about XSS vectors in the Markdown parser, component rendering, or path traversal in the asset loader are welcome.

## Best practices for consumers

- Pin semver ranges in `package.json` and review changelogs on upgrades.
- Sanitize any user-generated Markdown content before passing it to the framework if your threat model requires it.
- Keep Node.js and dependencies updated in projects that use this framework.
- Review custom components for XSS vulnerabilities before adding them to your site configuration.
