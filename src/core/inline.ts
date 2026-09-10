import type { InlineNode } from './ast';

export class InlineParser {
  parse(input: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let text = '';
    let i = 0;

    const flush = () => {
      if (text) {
        nodes.push({ type: 'text', value: text });
        text = '';
      }
    };

    while (i < input.length) {
      const char = input[i];

      if (char === '`') {
        const end = input.indexOf('`', i + 1);
        if (end !== -1) {
          flush();
          nodes.push({ type: 'code', value: input.slice(i + 1, end) });
          i = end + 1;
          continue;
        }
      }

      if (char === '!' && input[i + 1] === '[') {
        const parsed = this.parseLink(input, i + 1);
        if (parsed) {
          flush();
          nodes.push({
            type: 'image',
            alt: parsed.label,
            url: parsed.url,
          });
          i = parsed.next;
          continue;
        }
      }

      if (char === '[') {
        const parsed = this.parseLink(input, i);
        if (parsed) {
          flush();
          nodes.push({
            type: 'link',
            url: parsed.url,
            children: this.parse(parsed.label),
          });
          i = parsed.next;
          continue;
        }
      }

      if (char === '*' && input[i + 1] === '*') {
        const end = input.indexOf('**', i + 2);
        if (end !== -1) {
          flush();
          nodes.push({
            type: 'strong',
            children: this.parse(input.slice(i + 2, end)),
          });
          i = end + 2;
          continue;
        }
      }

      if (char === '*' || char === '_') {
        const end = input.indexOf(char, i + 1);
        if (end !== -1 && end > i + 1) {
          flush();
          nodes.push({
            type: 'emphasis',
            children: this.parse(input.slice(i + 1, end)),
          });
          i = end + 1;
          continue;
        }
      }

      text += char;
      i += 1;
    }

    flush();
    return nodes;
  }

  private parseLink(
    input: string,
    start: number
  ): { label: string; url: string; next: number } | null {
    if (input[start] !== '[') return null;

    const labelEnd = input.indexOf(']', start + 1);
    if (labelEnd === -1 || input[labelEnd + 1] !== '(') return null;

    const urlEnd = input.indexOf(')', labelEnd + 2);
    if (urlEnd === -1) return null;

    return {
      label: input.slice(start + 1, labelEnd),
      url: input.slice(labelEnd + 2, urlEnd).trim(),
      next: urlEnd + 1,
    };
  }
}
