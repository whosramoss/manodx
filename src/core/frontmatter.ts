export type FrontMatterData = Record<string, string>;

export class FrontMatterParser {
  parse(raw: string): { data: FrontMatterData; content: string } {
    const normalized = String(raw ?? '')
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n');

    if (!normalized.startsWith('---\n') && normalized !== '---') {
      return { data: {}, content: normalized };
    }

    const end = normalized.indexOf('\n---', 3);
    if (end === -1) {
      return { data: {}, content: normalized };
    }

    const block = normalized.slice(4, end);
    const rest = normalized.slice(end + 4).replace(/^\n/, '');
    const data: FrontMatterData = {};

    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const sep = trimmed.indexOf(':');
      if (sep === -1) continue;

      const key = trimmed.slice(0, sep).trim();
      let value = trimmed.slice(sep + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = value;
    }

    return { data, content: rest };
  }
}
