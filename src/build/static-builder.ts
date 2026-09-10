import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { loadContentDir } from '../loader/content-loader';
import { transpileForBrowser } from '../loader/ts-compiler';
import {
  copyAssets,
  frameworkAssetsDir,
  siteAssetsDir,
} from '../loader/asset-loader';
import { generateHtmlShell } from '../server/html-shell';
import type { ManodxConfig } from '../config/types';
import { defaultConfig } from '../config/types';

const FONTS = [
  'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BuildOptions {
  root: string;
  outDir?: string;
  configPath?: string;
}

function hash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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
  
  let bundle = '// manodx framework bundle\n';
  
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

export async function build(options: BuildOptions): Promise<void> {
  const { root, outDir = 'dist', configPath = 'manodx.config.ts' } = options;
  const packageRoot = getPackageRoot();
  const fullConfigPath = path.resolve(root, configPath);
  const outputDir = path.resolve(root, outDir);
  const assetsDir = path.join(outputDir, 'assets');

  console.log('[manodx] Building...');
  console.log(`  Root: ${root}`);
  console.log(`  Output: ${outputDir}`);

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  ensureDir(outputDir);
  ensureDir(assetsDir);

  console.log('[manodx] Loading config...');
  const config = await loadConfig(fullConfigPath);
  const contentDir = path.resolve(root, config.contentDir);

  console.log('[manodx] Loading content...');
  const content = loadContentDir(contentDir);
  const contentJson = JSON.stringify(content);
  
  console.log('[manodx] Bundling framework...');
  const frameworkBundle = bundleFramework(packageRoot);
  const frameworkHash = hash(frameworkBundle);
  const frameworkFile = `framework.${frameworkHash}.js`;
  fs.writeFileSync(path.join(assetsDir, frameworkFile), frameworkBundle);
  
  console.log('[manodx] Creating runtime...');
  const runtimeCode = `
// manodx runtime
const config = ${JSON.stringify(config)};
const rawContent = ${contentJson};

const modules = {};
for (const [key, value] of Object.entries(rawContent)) {
  modules[config.contentMarker + key] = value;
}

import { SiteApp } from './${frameworkFile}';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app element');

new SiteApp(root, modules, config).start();
`;
  const runtimeHash = hash(runtimeCode);
  const runtimeFile = `runtime.${runtimeHash}.js`;
  fs.writeFileSync(path.join(assetsDir, runtimeFile), runtimeCode);
  
  console.log('[manodx] Copying styles...');
  const cssPath = path.join(packageRoot, 'src', 'config', 'style.css');
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';
  const cssHash = hash(css);
  const cssFile = `style.${cssHash}.css`;
  fs.writeFileSync(path.join(assetsDir, cssFile), css);

  console.log('[manodx] Copying assets...');
  const frameworkAssets = copyAssets(
    frameworkAssetsDir(packageRoot),
    assetsDir
  );
  const siteAssets = copyAssets(siteAssetsDir(root), assetsDir);

  console.log('[manodx] Generating HTML...');
  const html = generateHtmlShell({
    config,
    fonts: FONTS,
    assetsBase: './assets',
    cssHref: `./assets/${cssFile}`,
    runtimeSrc: `./assets/${runtimeFile}`,
  });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  
  console.log('[manodx] Build complete!');
  console.log(`  Output: ${outputDir}`);
  console.log(`  Files:`);
  console.log(`    - index.html`);
  console.log(`    - assets/${cssFile}`);
  console.log(`    - assets/${frameworkFile}`);
  console.log(`    - assets/${runtimeFile}`);
  console.log(`    - assets: ${frameworkAssets.length} framework, ${siteAssets.length} site`);
}
