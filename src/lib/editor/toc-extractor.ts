import type { HeadingInfo } from '~/types/editor';
import { headingToId } from './heading-id';

export function extractHeadings(markdown: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = headingToId(text);
      headings.push({ id, text, level });
    }
  }
  return headings;
}
