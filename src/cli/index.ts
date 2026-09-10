import { parseArgs } from 'util';
import path from 'path';
import { startDevServer } from '../server/dev-server';
import { build } from '../build/static-builder';
import { startPreviewServer } from '../server/preview-server';
import { init } from './init';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    port: {
      type: 'string',
      short: 'p',
    },
    outDir: {
      type: 'string',
      short: 'o',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
});

const command = positionals[0];
const root = process.cwd();

function showHelp(): void {
  console.log(`
manodx - Tiny Markdown/MDX framework

Usage:
  manodx <command> [options]

Commands:
  init <name>   Create a new manodx project
  dev           Start development server with hot reload
  build         Build static site for production
  preview       Preview the production build locally

Options:
  -p, --port <port>    Port for dev/preview server (default: 4554/4173)
  -o, --outDir <dir>   Output directory for build (default: dist)
  -h, --help           Show this help message

Examples:
  manodx init my-site
  manodx dev
  manodx build
  manodx preview
  manodx dev --port 8080
`);
}

async function main(): Promise<void> {
  if (values.help || !command) {
    showHelp();
    process.exit(command ? 0 : 1);
  }

  switch (command) {
    case 'init': {
      const name = positionals[1];
      if (!name) {
        console.error('Error: Project name is required.\n');
        console.log('Usage: manodx init <project-name>');
        process.exit(1);
      }
      const targetDir = path.resolve(root, name);
      await init({ name, targetDir });
      break;
    }

    case 'dev': {
      const port = values.port ? parseInt(values.port, 10) : 4554;
      startDevServer({ root, port });
      break;
    }

    case 'build': {
      const outDir = values.outDir ?? 'dist';
      await build({ root, outDir });
      break;
    }

    case 'preview': {
      const port = values.port ? parseInt(values.port, 10) : 4173;
      const distDir = path.join(root, values.outDir ?? 'dist');
      startPreviewServer({ distDir, port });
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
