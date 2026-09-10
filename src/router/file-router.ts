export class FileRouter {
  constructor(
    private readonly contentMarker: string,
    private readonly indexFile: string
  ) {}

  toContentPath(modulePath: string): string {
    const normalized = modulePath.replace(/\\/g, '/');
    const index = normalized.lastIndexOf(this.contentMarker);
    return index === -1
      ? (normalized.split('/').pop() ?? normalized)
      : normalized.slice(index + this.contentMarker.length);
  }

  toRoute(contentPath: string): string {
    const noExt = contentPath.replace(/\.mdx?$/, '');
    if (noExt === this.indexFile.replace(/\.mdx?$/, '')) return '/';
    const dir = this.dirname(noExt);
    const base = noExt.slice(dir.length).replace(/^\//, '');
    if (base === 'main' || base === 'index') {
      return dir ? `/${dir}` : '/';
    }
    return `/${noExt}`;
  }

  dirname(filePath: string): string {
    const index = filePath.lastIndexOf('/');
    return index === -1 ? '' : filePath.slice(0, index);
  }

  join(dir: string, file: string): string {
    if (!dir) return file;
    if (!file || file.startsWith('/')) return file.replace(/^\//, '');
    return `${dir}/${file}`;
  }

  resolve(fromFile: string, ref: string): string {
    const cleaned = String(ref ?? '')
      .replace(/\\/g, '/')
      .replace(/^\.\//, '');
    if (!cleaned) return cleaned;
    if (cleaned.includes('/')) return cleaned;
    return this.join(this.dirname(fromFile), cleaned);
  }

  parent(file: string, has: (path: string) => boolean): string {
    if (!file.includes('/')) return this.indexFile;

    const dir = this.dirname(file);
    const sectionMain = `${dir}/main.md`;

    if (file === sectionMain) return this.indexFile;
    if (has(sectionMain)) return sectionMain;
    return this.indexFile;
  }
}
