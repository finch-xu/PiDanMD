/** Resolve a relative path against a base directory path (must end with '/'). */
export function resolvePath(base: string, relative: string): string {
  const parts = (base + relative).split('/');
  const resolved: string[] = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.' && p !== '') resolved.push(p);
  }
  return '/' + resolved.join('/');
}

/** Extract the directory portion of a file path (result ends with '/'). */
export function dirname(filePath: string): string {
  return filePath.replace(/[^/]+$/, '');
}
