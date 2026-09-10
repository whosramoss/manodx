import type { BlockNode, InlineNode, Root } from './ast';

export type ComponentRenderer = (
  props: Record<string, string>,
  children: string
) => string;

export interface RenderOptions {
  components?: Record<string, ComponentRenderer>;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class HtmlRenderer {
  render(root: Root, options: RenderOptions = {}): string {
    return this.renderBlocks(root.children, options);
  }

  private renderBlocks(nodes: BlockNode[], options: RenderOptions): string {
    return nodes.map((node) => this.renderBlock(node, options)).join('\n');
  }

  private renderBlock(node: BlockNode, options: RenderOptions): string {
    switch (node.type) {
      case 'heading': {
        const inner = this.renderInline(node.children);
        return `<h${node.depth} class="m-h${node.depth}">${inner}</h${node.depth}>`;
      }
      case 'paragraph':
        return `<p>${this.renderInline(node.children)}</p>`;
      case 'thematicBreak':
        return '<hr class="m-hr" />';
      case 'code':
        return `<pre class="m-pre"><code${
          node.lang ? ` class="language-${escapeHtml(node.lang)}"` : ''
        }>${escapeHtml(node.value)}</code></pre>`;
      case 'blockquote':
        return `<blockquote class="m-quote">${this.renderBlocks(
          node.children,
          options
        )}</blockquote>`;
      case 'list':
        return this.renderList(node, options);
      case 'table':
        return this.renderTable(node);
      case 'component':
        return this.renderComponent(node, options);
    }
  }

  private renderList(
    node: Extract<BlockNode, { type: 'list' }>,
    options: RenderOptions
  ): string {
    const tag = node.ordered ? 'ol' : 'ul';
    const startAttr =
      node.ordered && node.start !== 1 ? ` start="${node.start}"` : '';
    const items = node.items
      .map((item) => `<li>${this.renderBlocks(item.children, options)}</li>`)
      .join('');
    return `<${tag} class="m-list"${startAttr}>${items}</${tag}>`;
  }

  private renderTable(node: Extract<BlockNode, { type: 'table' }>): string {
    const alignStyle = (index: number) => {
      const align = node.align[index];
      return align ? ` style="text-align:${align}"` : '';
    };

    const head = node.header
      .map((cell, index) => `<th${alignStyle(index)}>${this.renderInline(cell)}</th>`)
      .join('');

    const body = node.rows
      .map(
        (row) =>
          `<tr>${row
            .map(
              (cell, index) =>
                `<td${alignStyle(index)}>${this.renderInline(cell)}</td>`
            )
            .join('')}</tr>`
      )
      .join('');

    return `<table class="m-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  private renderComponent(
    node: Extract<BlockNode, { type: 'component' }>,
    options: RenderOptions
  ): string {
    const renderer = options.components?.[node.name];
    const children = this.renderBlocks(node.children, options);

    if (!renderer) {
      return `<div class="m-component-missing" data-component="${escapeHtml(
        node.name
      )}">Unknown component: ${escapeHtml(node.name)}</div>`;
    }

    return renderer(node.props, children);
  }

  private renderInline(nodes: InlineNode[]): string {
    return nodes.map((node) => this.renderInlineNode(node)).join('');
  }

  private renderInlineNode(node: InlineNode): string {
    switch (node.type) {
      case 'text':
        return escapeHtml(node.value).replace(/\n/g, '<br>');
      case 'strong':
        return `<strong>${this.renderInline(node.children)}</strong>`;
      case 'emphasis':
        return `<em>${this.renderInline(node.children)}</em>`;
      case 'code':
        return `<code>${escapeHtml(node.value)}</code>`;
      case 'link':
        return `<a class="m-link" href="${escapeHtml(node.url)}">${this.renderInline(
          node.children
        )}</a>`;
      case 'image':
        return `<img class="m-image" src="${escapeHtml(node.url)}" alt="${escapeHtml(
          node.alt
        )}" />`;
    }
  }
}
