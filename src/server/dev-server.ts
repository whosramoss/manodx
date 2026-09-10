import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadContentDir } from '../loader/content-loader';
import { transpileForBrowser } from '../loader/ts-compiler';
import {
  ASSETS_DIR,
  frameworkAssetsDir,
  resolveAsset,
} from '../loader/asset-loader';
import { generateHtmlShell } from './html-shell';
import type { ManodxConfig } from '../config/types';
import { defaultConfig } from '../config/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DevServerOptions {
  root: string;
  port?: number;
  configPath?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const sseClients: Set<http.ServerResponse> = new Set();

function notifyReload(): void {
  for (const client of sseClients) {
    client.write('data: reload\n\n');
  }
}

function getPackageRoot(): string {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'src', 'index.ts'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function bundleFramework(packageRoot: string): string {
  const files = [
    'src/core/ast.ts',
    'src/core/inline.ts',
    'src/core/parser.ts',
    'src/core/frontmatter.ts',
    'src/core/renderer.ts',
    'src/router/file-router.ts',
    'src/content/document.ts',
    'src/content/registry.ts',
    'src/site/manodx-site.ts',
    'src/config/types.ts',
    'src/config/components.ts',
    'src/config/app.ts',
  ];
  
  let bundle = '// manodx framework bundle (dev)\n';
  
  for (const file of files) {
    const filePath = path.join(packageRoot, file);
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf-8');
      let transpiled = transpileForBrowser(code, path.basename(file));
      
      transpiled = transpiled.replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '');
      
      transpiled = transpiled.replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ');
      transpiled = transpiled.replace(/export\s+\{[^}]+\};?\n?/g, '');
      transpiled = transpiled.replace(/export\s+default\s+/g, '');
      transpiled = transpiled.replace(/export\s+type\s+\{[^}]+\};?\n?/g, '');
      
      bundle += `\n// --- ${file} ---\n${transpiled}\n`;
    }
  }
  
  bundle += `
// Exports
export { SiteApp, ManodxSite, defaultConfig, baseComponents, createManoCard };
`;
  
  return bundle;
}

async function loadConfig(configPath: string): Promise<ManodxConfig> {
  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }
  
  try {
    const configUrl = `file://${configPath.replace(/\\/g, '/')}`;
    const configModule = await import(configUrl);
    return configModule.default ?? defaultConfig;
  } catch {
    const code = fs.readFileSync(configPath, 'utf-8');
    
    const titleMatch = code.match(/title:\s*['"]([^'"]+)['"]/);
    const descMatch = code.match(/description:\s*['"]([^'"]+)['"]/);
    
    return {
      ...defaultConfig,
      title: titleMatch?.[1] ?? defaultConfig.title,
      description: descMatch?.[1] ?? defaultConfig.description,
    };
  }
}

export function createDevServer(options: DevServerOptions): http.Server {
  const { root, port = 4554, configPath = 'manodx.config.ts' } = options;
  const packageRoot = getPackageRoot();
  const fullConfigPath = path.resolve(root, configPath);
  const contentDir = path.resolve(root, defaultConfig.contentDir);
  
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    const pathname = url.pathname;
    
    try {
      if (pathname === '/__manodx/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        res.write('data: connected\n\n');
        sseClients.add(res);
        req.on('close', () => sseClients.delete(res));
        return;
      }
      
      if (pathname === '/' || pathname === '/index.html') {
        const config = await loadConfig(fullConfigPath);
        const html = generateHtmlShell({
          config,
          fonts: ['https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap'],
          liveReload: true,
        });
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        res.end(html);
        return;
      }
      
      if (pathname.startsWith('/__manodx/')) {
        const endpoint = pathname.replace('/__manodx/', '');
        
        if (endpoint === 'content.json') {
          const config = await loadConfig(fullConfigPath);
          const dir = path.resolve(root, config.contentDir);
          const content = loadContentDir(dir);
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
          res.end(JSON.stringify(content));
          return;
        }
        
        if (endpoint === 'config.js') {
          const config = await loadConfig(fullConfigPath);
          const js = `export default ${JSON.stringify(config)};`;
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
          res.end(js);
          return;
        }
        
        if (endpoint === 'style.css') {
          const cssPath = path.join(packageRoot, 'src', 'config', 'style.css');
          if (fs.existsSync(cssPath)) {
            const css = fs.readFileSync(cssPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': MIME_TYPES['.css'] });
            res.end(css);
            return;
          }
        }
        
        if (endpoint === 'runtime.js') {
          const runtimePath = path.join(packageRoot, 'src', 'runtime', 'bootstrap.ts');
          if (fs.existsSync(runtimePath)) {
            const code = fs.readFileSync(runtimePath, 'utf-8');
            const js = transpileForBrowser(code, 'bootstrap.ts');
            res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
            res.end(js);
            return;
          }
        }
        
        if (endpoint === 'framework.js') {
          const bundle = bundleFramework(packageRoot);
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
          res.end(bundle);
          return;
        }
      }
      
      const filePath = path.join(root, pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream';
        
        if (ext === '.ts') {
          const code = fs.readFileSync(filePath, 'utf-8');
          const js = transpileForBrowser(code, path.basename(filePath));
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
          res.end(js);
          return;
        }
        
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
        return;
      }

      // Icons and share images that ship with the framework. The site's own
      // assets directory is checked first, so it can override any of them.
      if (pathname.startsWith(`/${ASSETS_DIR}/`)) {
        const fallback = resolveAsset(
          frameworkAssetsDir(packageRoot),
          pathname.slice(ASSETS_DIR.length + 2)
        );

        if (fallback) {
          const ext = path.extname(fallback);
          res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
          });
          res.end(fs.readFileSync(fallback));
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${error}`);
    }
  });
  
  const watchDirs = [contentDir, root];
  for (const dir of watchDirs) {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (event, filename) => {
        if (filename && !filename.includes('node_modules')) {
          console.log(`[manodx] ${event}: ${filename}`);
          notifyReload();
        }
      });
    }
  }
  
  return server;
}

export function startDevServer(options: DevServerOptions): void {
  const port = options.port ?? 4554;
  const server = createDevServer(options);
  
  server.listen(port, () => {
    console.log(`
  manodx dev server running at:

    ➜  Local:   http://localhost:${port}/
    ➜  press Ctrl+C to stop
`);
  });
}
