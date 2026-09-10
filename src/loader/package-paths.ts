import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transpileForBrowser } from './ts-compiler';

const FRAMEWORK_SOURCES = [
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

/** Walks up from a starting file URL/path until the manodx package root. */
export function getPackageRoot(fromUrl: string = import.meta.url): string {
  let dir = path.dirname(fileURLToPath(fromUrl));

  while (dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
          name?: string;
        };
        if (pkg.name === 'manodx') return dir;
      } catch {
        // keep walking
      }
    }

    const hasSrc = fs.existsSync(path.join(dir, 'src', 'index.ts'));
    const hasDist = fs.existsSync(path.join(dir, 'dist', 'index.js'));
    if (hasSrc || hasDist) return dir;

    dir = path.dirname(dir);
  }

  return process.cwd();
}

function firstExisting(...candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function resolveStyleCss(packageRoot: string): string | null {
  return firstExisting(
    path.join(packageRoot, 'dist', 'config', 'style.css'),
    path.join(packageRoot, 'src', 'config', 'style.css'),
  );
}

export function resolveRuntimeBootstrap(packageRoot: string): string | null {
  return firstExisting(
    path.join(packageRoot, 'dist', 'browser', 'runtime.js'),
    path.join(packageRoot, 'src', 'runtime', 'bootstrap.ts'),
  );
}

export function resolveFrameworkAssetsDir(packageRoot: string): string {
  const distAssets = path.join(packageRoot, 'dist', 'assets');
  if (fs.existsSync(distAssets)) return distAssets;
  return path.join(packageRoot, 'src', 'assets');
}

/** Build the browser framework bundle from TypeScript sources (dev / package build). */
export function buildBrowserFrameworkFromSrc(packageRoot: string): string {
  let bundle = '// manodx framework bundle\n';

  for (const file of FRAMEWORK_SOURCES) {
    const filePath = path.join(packageRoot, file);
    if (!fs.existsSync(filePath)) continue;

    const code = fs.readFileSync(filePath, 'utf-8');
    let transpiled = transpileForBrowser(code, path.basename(file));

    transpiled = transpiled.replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '');
    transpiled = transpiled.replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ');
    transpiled = transpiled.replace(/export\s+\{[^}]+\};?\n?/g, '');
    transpiled = transpiled.replace(/export\s+default\s+/g, '');
    transpiled = transpiled.replace(/export\s+type\s+\{[^}]+\};?\n?/g, '');

    bundle += `\n// --- ${file} ---\n${transpiled}\n`;
  }

  bundle += `
// Exports
export { SiteApp, ManodxSite, defaultConfig, baseComponents, createManoCard };
`;

  return bundle;
}

/** Prefer prebuilt dist/browser/framework.js; fall back to assembling from src/. */
export function loadBrowserFramework(packageRoot: string): string {
  const prebuilt = path.join(packageRoot, 'dist', 'browser', 'framework.js');
  if (fs.existsSync(prebuilt)) {
    return fs.readFileSync(prebuilt, 'utf-8');
  }
  return buildBrowserFrameworkFromSrc(packageRoot);
}

export function loadRuntimeScript(packageRoot: string): string | null {
  const resolved = resolveRuntimeBootstrap(packageRoot);
  if (!resolved) return null;

  const code = fs.readFileSync(resolved, 'utf-8');
  if (resolved.endsWith('.ts')) {
    return transpileForBrowser(code, path.basename(resolved));
  }
  return code;
}
