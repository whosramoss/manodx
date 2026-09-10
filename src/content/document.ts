import type { Root } from '../core/ast';
import type { FrontMatterData } from '../core/frontmatter';

export interface Document {
  file: string;
  route: string;
  modulePath: string;
  raw: string;
  meta: FrontMatterData;
  content: string;
  ast: Root;
  type: string;
  title: string;
}
