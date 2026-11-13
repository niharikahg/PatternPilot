import type { Breakdown } from './types';
export function validSlowerGuess(b: Breakdown, guess: string) {
 return /anagram/i.test(b.title) && guess === 'Two Pointers' && b.pattern.name === 'Arrays & Hashing';
}
export function patternVerdict(b:Breakdown, guess:string) {
 if(guess===b.pattern.name)return `Correct — ${b.pattern.why}`;
 if(validSlowerGuess(b,guess))return 'Works, but slower — sort both strings, then compare with two pointers in O(n log n). Hashing or letter counts gets O(n) without sorting.';
 if(b.title==='Two Sum'&&guess==='Two Pointers')return 'Not quite — Two Pointers needs sorted values; sorting also requires tracking original indices. Hashing finds each complement while preserving indices.';
 return `Not quite — ${b.pattern.name} fits best: ${b.pattern.why}`;
}
export function reviewOutcome(verdict:string) {return verdict==='Looks correct'?'solved' as const:'retry' as const;}