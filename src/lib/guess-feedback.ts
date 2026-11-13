import type { Breakdown } from './types';
export function patternVerdict(b:Breakdown, guess:string) {
 if(guess===b.pattern.name)return `Correct — ${b.pattern.why}`;
 if(b.title==='Two Sum'&&guess==='Two Pointers')return 'Not quite — Two Pointers needs sorted values; sorting also requires tracking original indices. Hashing finds each complement while preserving indices.';
 return `Not quite — ${b.pattern.name} fits best: ${b.pattern.why}`;
}
export function reviewOutcome(verdict:string) {return verdict==='Looks correct'?'solved' as const:'retry' as const;}