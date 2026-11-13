import { expect, test } from 'vitest';
import { PRACTICE_ORDER, canOpenPracticeStep } from './practice-order';
import { freshSession } from './practice';
test('Guess follows both coding activities immediately before Reveal',()=>{
 expect(PRACTICE_ORDER).toEqual(['understand','walkthrough','code','bug','guess','reveal','log']);
});
test('learners can reach walkthrough and coding without guessing; Reveal waits for both guesses',()=>{
 const fresh=freshSession();
 for(const step of ['walkthrough','code','bug','guess']) expect(canOpenPracticeStep(step,fresh)).toBe(true);
 expect(canOpenPracticeStep('reveal',{...fresh,submitted:true})).toBe(false);
 expect(canOpenPracticeStep('reveal',{...fresh,patternGuess:'Arrays & Hashing',complexityGuess:'n'})).toBe(true);
 expect(canOpenPracticeStep('log',fresh)).toBe(false);
});
test('problems without a complexity bet require only the pattern guess',()=>{
 expect(canOpenPracticeStep('reveal',{...freshSession(),patternGuess:'Stack'},false)).toBe(true);
});