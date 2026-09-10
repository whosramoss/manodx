import type {
  BlockNode,
  InlineNode,
  ListItem,
  Root,
  TableAlign,
} from './ast';
import { InlineParser } from './inline';

export class MarkdownParser {
  private readonly inline = new InlineParser();

  private static readonly HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
  private static readonly THEMATIC_BREAK = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
  private static readonly UNORDERED = /^(\s*)[-*+]\s+(.*)$/;
  private static readonly ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
  private static readonly FENCE = /^(\s*)(```|~~~)\s*([\w-]*)\s*$/;
  private static readonly SELF_CLOSING =
    /^<([A-Z][A-Za-z0-9]*)\s*(.*?)\/>\s*$/;
  private static readonly OPEN_TAG = /^<([A-Z][A-Za-z0-9]*)\s*(.*?)>\s*$/;

  parse(input: string): Root {
    const lines = input.replace(/\r\n/g, '\n').split('\n');
    return { type: 'root', children: this.parseBlocks(lines) };
  }

  parseInline(input: string): InlineNode[] {
    return this.inline.parse(input);
  }

  private parseBlocks(lines: string[]): BlockNode[] {
    const blocks: BlockNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        i += 1;
        continue;
      }

      const fence = line.match(MarkdownParser.FENCE);
      if (fence) {
        const result = this.parseFence(lines, i, fence[2], fence[3]);
        blocks.push(result.node);
        i = result.next;
        continue;
      }

      if (/^<[A-Z]/.test(line.trim())) {
        const result = this.parseComponent(lines, i);
        if (result) {
          blocks.push(result.node);
          i = result.next;
          continue;
        }
      }

      const heading = line.match(MarkdownParser.HEADING);
      if (heading) {
        blocks.push({
          type: 'heading',
          depth: heading[1].length,
          children: this.inline.parse(heading[2]),
        });
        i += 1;
        continue;
      }

      if (MarkdownParser.THEMATIC_BREAK.test(line)) {
        blocks.push({ type: 'thematicBreak' });
        i += 1;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const result = this.parseBlockquote(lines, i);
        blocks.push(result.node);
        i = result.next;
        continue;
      }

      if (this.isTableRow(line) && this.isTableSeparator(lines[i + 1] ?? '')) {
        const result = this.parseTable(lines, i);
        blocks.push(result.node);
        i = result.next;
        continue;
      }

      if (
        MarkdownParser.UNORDERED.test(line) ||
        MarkdownParser.ORDERED.test(line)
      ) {
        const result = this.parseList(lines, i);
        blocks.push(result.node);
        i = result.next;
        continue;
      }

      const result = this.parseParagraph(lines, i);
      blocks.push(result.node);
      i = result.next;
    }

    return blocks;
  }

  private parseFence(
    lines: string[],
    start: number,
    marker: string,
    lang: string
  ): { node: BlockNode; next: number } {
    const buffer: string[] = [];
    let i = start + 1;

    while (i < lines.length && !lines[i].trim().startsWith(marker)) {
      buffer.push(lines[i]);
      i += 1;
    }

    return {
      node: {
        type: 'code',
        lang: lang || null,
        value: buffer.join('\n'),
      },
      next: i < lines.length ? i + 1 : i,
    };
  }

  private parseComponent(
    lines: string[],
    start: number
  ): { node: BlockNode; next: number } | null {
    const line = lines[start].trim();

    const selfClosing = line.match(MarkdownParser.SELF_CLOSING);
    if (selfClosing) {
      return {
        node: {
          type: 'component',
          name: selfClosing[1],
          props: this.parseProps(selfClosing[2]),
          children: [],
        },
        next: start + 1,
      };
    }

    const open = line.match(MarkdownParser.OPEN_TAG);
    if (open) {
      const name = open[1];
      const closeTag = `</${name}>`;
      const inner: string[] = [];
      let i = start + 1;

      while (i < lines.length && lines[i].trim() !== closeTag) {
        inner.push(lines[i]);
        i += 1;
      }

      return {
        node: {
          type: 'component',
          name,
          props: this.parseProps(open[2]),
          children: this.parseBlocks(inner),
        },
        next: i < lines.length ? i + 1 : i,
      };
    }

    return null;
  }

  private parseProps(raw: string): Record<string, string> {
    const props: Record<string, string> = {};
    const re = /([A-Za-z0-9_-]+)\s*=\s*"([^"]*)"|([A-Za-z0-9_-]+)\s*=\s*'([^']*)'/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(raw)) !== null) {
      if (match[1] !== undefined) props[match[1]] = match[2];
      else if (match[3] !== undefined) props[match[3]] = match[4];
    }

    return props;
  }

  private parseBlockquote(
    lines: string[],
    start: number
  ): { node: BlockNode; next: number } {
    const inner: string[] = [];
    let i = start;

    while (i < lines.length && /^\s*>/.test(lines[i])) {
      inner.push(lines[i].replace(/^\s*>\s?/, ''));
      i += 1;
    }

    return {
      node: { type: 'blockquote', children: this.parseBlocks(inner) },
      next: i,
    };
  }

  private parseParagraph(
    lines: string[],
    start: number
  ): { node: BlockNode; next: number } {
    const buffer: string[] = [];
    let i = start;

    while (i < lines.length && this.isParagraphLine(lines, i)) {
      buffer.push(lines[i].trim());
      i += 1;
    }

    return {
      node: { type: 'paragraph', children: this.inline.parse(buffer.join('\n')) },
      next: i,
    };
  }

  private isParagraphLine(lines: string[], i: number): boolean {
    const line = lines[i];
    if (!line.trim()) return false;
    if (MarkdownParser.HEADING.test(line)) return false;
    if (MarkdownParser.THEMATIC_BREAK.test(line)) return false;
    if (MarkdownParser.FENCE.test(line)) return false;
    if (MarkdownParser.UNORDERED.test(line)) return false;
    if (MarkdownParser.ORDERED.test(line)) return false;
    if (/^\s*>/.test(line)) return false;
    if (/^<[A-Z]/.test(line.trim())) return false;
    if (this.isTableRow(line) && this.isTableSeparator(lines[i + 1] ?? '')) {
      return false;
    }
    return true;
  }

  private parseList(
    lines: string[],
    start: number
  ): { node: BlockNode; next: number } {
    const first =
      lines[start].match(MarkdownParser.UNORDERED) ??
      lines[start].match(MarkdownParser.ORDERED);
    const ordered = MarkdownParser.ORDERED.test(lines[start]);
    const baseIndent = (first?.[1] ?? '').length;
    const startNum = ordered ? Number((first as RegExpMatchArray)[2]) : 1;

    const items: ListItem[] = [];
    let i = start;
    let current: string[] | null = null;

    const commit = () => {
      if (current) {
        items.push({ children: this.parseBlocks(current) });
        current = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        if (current) current.push('');
        i += 1;
        continue;
      }

      const unordered = line.match(MarkdownParser.UNORDERED);
      const orderedMatch = line.match(MarkdownParser.ORDERED);
      const match = unordered ?? orderedMatch;
      const indent = match ? match[1].length : this.leadingSpaces(line);

      if (match && indent === baseIndent) {
        commit();
        current = [match === unordered ? unordered![2] : orderedMatch![3]];
        i += 1;
        continue;
      }

      if (indent > baseIndent && current) {
        current.push(line.slice(baseIndent + 2));
        i += 1;
        continue;
      }

      break;
    }

    commit();
    return {
      node: { type: 'list', ordered, start: startNum, items },
      next: i,
    };
  }

  private leadingSpaces(line: string): number {
    return line.length - line.trimStart().length;
  }

  private isTableRow(line: string): boolean {
    return /^\s*\|.*\|\s*$/.test(line);
  }

  private isTableSeparator(line: string): boolean {
    return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
  }

  private splitRow(line: string): string[] {
    return line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
  }

  private parseTable(
    lines: string[],
    start: number
  ): { node: BlockNode; next: number } {
    const header = this.splitRow(lines[start]);
    const align: TableAlign[] = this.splitRow(lines[start + 1]).map((cell) => {
      const left = cell.startsWith(':');
      const right = cell.endsWith(':');
      if (left && right) return 'center';
      if (right) return 'right';
      if (left) return 'left';
      return null;
    });

    const rows: string[][] = [];
    let i = start + 2;
    while (i < lines.length && this.isTableRow(lines[i])) {
      rows.push(this.splitRow(lines[i]));
      i += 1;
    }

    return {
      node: {
        type: 'table',
        align,
        header: header.map((cell) => this.inline.parse(cell)),
        rows: rows.map((row) => row.map((cell) => this.inline.parse(cell))),
      },
      next: i,
    };
  }
}
