export function indentCode(code: string, start: number, end: number) {
  return {code:code.slice(0,start)+'    '+code.slice(end),cursor:start+4};
}
export function newlineCode(code: string, start: number, end: number, language: string) {
  const line = code.slice(0, start).split('\n').at(-1) ?? '';
  const indent = line.match(/^\s*/)?.[0] ?? '';
  const extra = language === 'python' && line.trimEnd().endsWith(':') ? '    ' : '';
  const insertion = '\n' + indent + extra;
  return { code: code.slice(0,start) + insertion + code.slice(end), cursor: start + insertion.length };
}