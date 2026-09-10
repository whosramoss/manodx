import fs from 'fs';
import path from 'path';

const CONFIG_TEMPLATE = `import { type ManodxConfig, defaultConfig } from "manodx";

const config: ManodxConfig = {
  ...defaultConfig,
  title: "{{name}}",
  description: "Built with manodx",
};

export default config;
`;

const MAIN_MD_TEMPLATE = `---
type: home
title: {{name}}
description: Built with manodx
badge: Welcome
showSwitchButtonTheme: true
---

<ManoWarning>
Your new manodx site is ready!
</ManoWarning>

## Getting Started

Edit this file at \`app/main.md\` to customize your home page.

<ManoCallout label="tip" title="Next Steps">
Create more pages by adding \`.md\` files in the \`app/\` directory.
</ManoCallout>

## Features

- **Markdown** — Write content in Markdown
- **Components** — Use MDX-style components like \`<ManoCallout>\`
- **Routing** — File-based routing from the \`app/\` directory
- **Themes** — Light/dark mode with the switch above
`;

const PACKAGE_JSON_TEMPLATE = `{
  "name": "{{name}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "manodx dev",
    "build": "manodx build",
    "preview": "manodx preview"
  },
  "dependencies": {
    "manodx": "latest"
  }
}
`;

const GITIGNORE_TEMPLATE = `node_modules
dist
.DS_Store
`;

export interface InitOptions {
  name: string;
  targetDir: string;
}

export async function init(options: InitOptions): Promise<void> {
  const { name, targetDir } = options;

  console.log(`\n  Creating manodx project in ${targetDir}...\n`);

  // Create directories
  const appDir = path.join(targetDir, 'app');
  const assetsDir = path.join(targetDir, 'assets');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Write files
  const files = [
    {
      path: path.join(targetDir, 'manodx.config.ts'),
      content: CONFIG_TEMPLATE.replace(/\{\{name\}\}/g, name),
    },
    {
      path: path.join(targetDir, 'package.json'),
      content: PACKAGE_JSON_TEMPLATE.replace(/\{\{name\}\}/g, toPackageName(name)),
    },
    {
      path: path.join(targetDir, '.gitignore'),
      content: GITIGNORE_TEMPLATE,
    },
    {
      path: path.join(appDir, 'main.md'),
      content: MAIN_MD_TEMPLATE.replace(/\{\{name\}\}/g, name),
    },
  ];

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.content);
      console.log(`  ✓ ${path.relative(targetDir, file.path)}`);
    } else {
      console.log(`  · ${path.relative(targetDir, file.path)} (exists, skipped)`);
    }
  }

  console.log(`
  Done! To get started:

    cd ${name}
    npm install
    npm run dev

  Open http://localhost:4554 to see your site.
`);
}

function toPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
