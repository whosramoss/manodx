import { FrontMatterParser } from '../core/frontmatter';
import { MarkdownParser } from '../core/parser';
import type { FileRouter } from '../router/file-router';
import type { Document } from './document';

export class DocumentRegistry {
  private readonly docs = new Map<string, Document>();
  private readonly byRoute = new Map<string, Document>();

  constructor(
    private readonly frontMatter: FrontMatterParser,
    private readonly parser: MarkdownParser,
    private readonly router: FileRouter
  ) {}

  load(modules: Record<string, string>): void {
    this.docs.clear();
    this.byRoute.clear();

    for (const [modulePath, raw] of Object.entries(modules)) {
      const file = this.router.toContentPath(modulePath);
      const { data: meta, content } = this.frontMatter.parse(raw);
      const ast = this.parser.parse(content);

      const doc: Document = {
        file,
        route: this.router.toRoute(file),
        modulePath,
        raw,
        meta,
        content,
        ast,
        type: (meta.type ?? 'page').toLowerCase(),
        title:
          meta.title ??
          content.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
          file,
      };

      this.docs.set(file, doc);
      this.byRoute.set(doc.route, doc);
    }
  }

  get(file: string): Document | undefined {
    return this.docs.get(file);
  }

  getByRoute(route: string): Document | undefined {
    return this.byRoute.get(route);
  }

  has(file: string): boolean {
    return this.docs.has(file);
  }

  all(): Document[] {
    return [...this.docs.values()];
  }
}
