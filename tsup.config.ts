import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const destPath = join(dest, file.name);
    if (file.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig([
  {
    entry: ['src/**/*.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
    target: 'node18',
    bundle: false,
    onSuccess: async () => {
      // Copy static assets
      copyFileSync('src/config/style.css', 'dist/config/style.css');
      copyDir('src/assets', 'dist/assets');
      console.log('Copied static assets to dist/');
    },
  },
]);
