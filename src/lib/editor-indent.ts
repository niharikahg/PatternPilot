export function indentCode(code: string, start: number, end: number) {
  return {code:code.slice(0,start)+'    '+code.slice(end),cursor:start+4};
}