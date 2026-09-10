import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join } from "path";

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
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    target: "node18",
    bundle: true,
    banner: { js: "#!/usr/bin/env node" },
    clean: true,
  },
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    target: "node18",
    bundle: true,
    onSuccess: async () => {
      mkdirSync("dist/config", { recursive: true });
      mkdirSync("dist/assets", { recursive: true });
      copyFileSync("src/config/style.css", "dist/config/style.css");
      copyDir("src/assets", "dist/assets");
      console.log("Copied static assets to dist/");
    },
  },
]);
