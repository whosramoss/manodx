import { FrontMatterParser } from '../core/frontmatter';
import { MarkdownParser } from '../core/parser';
import {
  HtmlRenderer,
  type ComponentRenderer,
  type RenderOptions,
} from '../core/renderer';
import { DocumentRegistry } from '../content/registry';
import type { Document } from '../content/document';
import { FileRouter } from '../router/file-router';

export interface SiteOptions {
  modules: Record<string, string>;
  contentMarker?: string;
  indexFile?: string;
  components?: Record<string, ComponentRenderer>;
}

export class ManodxSite {
  readonly registry: DocumentRegistry;
  readonly router: FileRouter;
  readonly indexFile: string;

  private readonly renderer = new HtmlRenderer();
  private readonly baseComponents: Record<string, ComponentRenderer>;

  constructor(options: SiteOptions) {
    this.indexFile = options.indexFile ?? 'main.md';
    this.router = new FileRouter(
      options.contentMarker ?? '/app/',
      this.indexFile
    );
    this.registry = new DocumentRegistry(
      new FrontMatterParser(),
      new MarkdownParser(),
      this.router
    );
    this.baseComponents = options.components ?? {};
    this.registry.load(options.modules);
  }

  get(file: string): Document | undefined {
    return this.registry.get(file);
  }

  renderDocument(
    doc: Document,
    components: Record<string, ComponentRenderer> = {}
  ): string {
    const options: RenderOptions = {
      components: { ...this.baseComponents, ...components },
    };
    return this.renderer.render(doc.ast, options);
  }

  renderMarkdown(
    markdown: string,
    components: Record<string, ComponentRenderer> = {}
  ): string {
    const parser = new MarkdownParser();
    return this.renderer.render(parser.parse(markdown), {
      components: { ...this.baseComponents, ...components },
    });
  }

  parentOf(file: string): string {
    return this.router.parent(file, (path) => this.registry.has(path));
  }
}
