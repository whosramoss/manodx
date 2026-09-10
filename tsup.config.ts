import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    dts: false,
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
    target: 'node18',
    bundle: true,
    banner: { js: '#!/usr/bin/env node' },
    clean: true,
  },
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
    target: 'node18',
    bundle: true,
  },
]);
