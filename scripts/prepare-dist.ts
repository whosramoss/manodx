import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  writeFileSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import {
  buildBrowserFrameworkFromSrc,
} from '../src/loader/package-paths';
import { transpileForBrowser } from '../src/loader/ts-compiler';

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

mkdirSync('dist/config', { recursive: true });
mkdirSync('dist/assets', { recursive: true });
mkdirSync('dist/browser', { recursive: true });

copyFileSync('src/config/style.css', 'dist/config/style.css');
copyDir('src/assets', 'dist/assets');

writeFileSync(
  'dist/browser/framework.js',
  buildBrowserFrameworkFromSrc(process.cwd()),
);

const bootstrap = readFileSync('src/runtime/bootstrap.ts', 'utf-8');
writeFileSync(
  'dist/browser/runtime.js',
  transpileForBrowser(bootstrap, 'bootstrap.ts'),
);

console.log('Prepared dist assets, browser framework, and runtime');
