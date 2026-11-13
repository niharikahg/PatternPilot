export function codeStarter(solution: string, language: string): string {
  if (language === 'python') {
    const signature = solution.match(/^def\s+[^\n]+:/m)?.[0];
    return signature ? signature + '\n    ' : 'def solve(value):\n    ';
  }
  if (language === 'javascript') {
    const signature = solution.match(/function\s+[^\n{]+\{/m)?.[0];
    return signature ? signature + '\n    \n}' : 'function solve(value) {\n    \n}';
  }
  const signature = solution.match(/public\s+(?:static\s+)?[\w<>\[\], ?]+\s+\w+\([^)]*\)\s*\{/m)?.[0];
  return signature ? 'class Solution {\n    ' + signature + '\n        \n    }\n}' : 'class Solution {\n    public int solve(int[] value) {\n        \n    }\n}';
}