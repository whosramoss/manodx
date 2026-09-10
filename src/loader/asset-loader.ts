import fs from 'fs';
import path from 'path';

/**
 * Icons and share images shipped with the framework. Every manodx site gets
 * them, and a site can override any of them by placing a file with the same
 * name in its own assets directory.
 */
export const ASSETS_DIR = 'assets';

export function frameworkAssetsDir(packageRoot: string): string {
  return path.join(packageRoot, 'src', ASSETS_DIR);
}

export function siteAssetsDir(root: string): string {
  return path.join(root, ASSETS_DIR);
}

/** Resolves a request under `/assets/` against a directory, or null. */
export function resolveAsset(dir: string, assetPath: string): string | null {
  const cleaned = assetPath.replace(/^\/+/, '');
  if (!cleaned || cleaned.includes('..')) return null;

  const filePath = path.join(dir, cleaned);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;

  return filePath;
}

/** Copies every file of `sourceDir` into `targetDir`, returning the names. */
export function copyAssets(sourceDir: string, targetDir: string): string[] {
  if (!fs.existsSync(sourceDir)) return [];

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const copied: string[] = [];

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const from = path.join(sourceDir, entry.name);
    const to = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      for (const nested of copyAssets(from, to)) {
        copied.push(path.posix.join(entry.name, nested));
      }
    } else {
      fs.copyFileSync(from, to);
      copied.push(entry.name);
    }
  }

  return copied;
}
