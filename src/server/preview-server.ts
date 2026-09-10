import http from "http";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export interface PreviewServerOptions {
  distDir: string;
  port?: number;
}

export function createPreviewServer(
  options: PreviewServerOptions,
): http.Server {
  const { distDir, port = 4173 } = options;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    let pathname = url.pathname;

    if (pathname === "/") {
      pathname = "/index.html";
    }

    const filePath = path.join(distDir, pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
      const content = fs.readFileSync(filePath);

      res.writeHead(200, {
        "Content-Type": mimeType,
        "Cache-Control":
          ext === ".html" ? "no-cache" : "public, max-age=31536000",
      });
      res.end(content);
      return;
    }

    const indexPath = path.join(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[".html"],
        "Cache-Control": "no-cache",
      });
      res.end(content);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return server;
}

export function startPreviewServer(options: PreviewServerOptions): void {
  const port = options.port ?? 4173;
  const server = createPreviewServer(options);

  server.listen(port, () => {
    console.log(`
  manodx preview server running at:

    ➜  Local:   http://localhost:${port}/
    ➜  press Ctrl+C to stop
`);
  });
}
