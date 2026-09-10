import type { ManodxConfig } from "../config/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface HtmlShellOptions {
  config: ManodxConfig;
  fonts?: string[];
  liveReload?: boolean;
  /** Where the framework/site assets are published. */
  assetsBase?: string;
  cssHref?: string;
  runtimeSrc?: string;
}

function iconLinks(base: string): string {
  return `
  <link rel="icon" href="${base}/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${base}/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${base}/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="192x192" href="${base}/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="${base}/android-chrome-512x512.png">
  <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png">`;
}

export function generateHtmlShell(options: HtmlShellOptions): string {
  const {
    config,
    fonts = [],
    liveReload = false,
    assetsBase = "/assets",
    cssHref = "/__manodx/style.css",
    runtimeSrc = "/__manodx/runtime.js",
  } = options;

  const fontLinks =
    fonts.length > 0
      ? `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fonts.join(",")}" rel="stylesheet" />`
      : "";

  const liveReloadScript = liveReload
    ? `
  <script>
    const evtSource = new EventSource('/__manodx/events');
    evtSource.onmessage = (e) => {
      if (e.data === 'reload') location.reload();
    };
  </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${escapeHtml(config.description)}">
  <title>${escapeHtml(config.title)}</title>${iconLinks(assetsBase)}
  <meta property="og:title" content="${escapeHtml(config.title)}">
  <meta property="og:description" content="${escapeHtml(config.description)}">
  <meta property="og:image" content="${assetsBase}/thumbnail.png">
  <meta name="twitter:card" content="summary_large_image">${fontLinks}
  <link rel="stylesheet" href="${cssHref}">
</head>
<body>
  <main id="app"></main>
  <script type="module" src="${runtimeSrc}"></script>${liveReloadScript}
</body>
</html>`;
}
