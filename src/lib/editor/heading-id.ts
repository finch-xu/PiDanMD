/** Convert heading text to a URL-friendly anchor ID. */
export function headingToId(text: string): string {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
}
