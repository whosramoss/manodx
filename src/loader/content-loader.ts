import fs from 'fs';
import path from 'path';

export function loadContentDir(dir: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  function walk(currentDir: string, relativePath: string = ''): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        result[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  
  return result;
}

export function loadContentForRegistry(
  dir: string,
  contentMarker: string = '/app/'
): Record<string, string> {
  const raw = loadContentDir(dir);
  const result: Record<string, string> = {};
  
  for (const [relativePath, content] of Object.entries(raw)) {
    const key = `${contentMarker}${relativePath}`;
    result[key] = content;
  }
  
  return result;
}
