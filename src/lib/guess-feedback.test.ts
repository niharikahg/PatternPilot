import {it,expect} from 'vitest';
import {patternVerdict,reviewOutcome,validSlowerGuess} from './guess-feedback';
import b from './practice-data/0.json';
import anagram from './practice-data/10.json';
import type {Breakdown} from './types';
it('corrects the Two Pointers guess with an indices explanation',()=>{expect(patternVerdict(b as Breakdown,'Two Pointers')).toContain('original indices');expect(patternVerdict(b as Breakdown,'Two Pointers')).toContain('Hashing');});
it('maps an AI solved review into solved log status',()=>expect(reviewOutcome('Looks correct')).toBe('solved'));
it('maps a failed review into retry status',()=>expect(reviewOutcome('Needs work')).toBe('retry'));
it('accepts sorting plus two pointers as a valid slower anagram approach',()=>{
 expect(validSlowerGuess(anagram as Breakdown,'Two Pointers')).toBe(true);
 expect(validSlowerGuess(b as Breakdown,'Two Pointers')).toBe(false);
});