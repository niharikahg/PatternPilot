export function stringInputs(example: string) {
  return [...example.matchAll(/\b([A-Za-z]\w*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => ({ name: match[1] ?? '', cells: Array.from(match[2] ?? match[3] ?? '') }));
}