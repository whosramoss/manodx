export type TableAlign = 'left' | 'center' | 'right' | null;

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; url: string; children: InlineNode[] }
  | { type: 'image'; url: string; alt: string };

export type BlockNode =
  | { type: 'heading'; depth: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; start: number; items: ListItem[] }
  | {
      type: 'table';
      align: TableAlign[];
      header: InlineNode[][];
      rows: InlineNode[][][];
    }
  | { type: 'code'; lang: string | null; value: string }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'thematicBreak' }
  | {
      type: 'component';
      name: string;
      props: Record<string, string>;
      children: BlockNode[];
    };

export interface ListItem {
  children: BlockNode[];
}

export interface Root {
  type: 'root';
  children: BlockNode[];
}
