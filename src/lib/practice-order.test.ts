import { expect, test } from 'vitest';
import { PRACTICE_ORDER, canOpenPracticeStep } from './practice-order';
import { freshSession } from './practice';
test('Guess precedes walkthrough and coding to preserve prediction value',()=>{
 expect(PRACTICE_ORDER).toEqual(['understand','guess','walkthrough','code','bug','reveal','log']);
});
test('experienced learners can open code and return to other activities without guesses',()=>{
 const fresh=freshSession();
 for(const step of ['walkthrough','code','bug']) expect(canOpenPracticeStep(step,fresh)).toBe(true);
 expect(canOpenPracticeStep('guess',fresh)).toBe(true);
 expect(canOpenPracticeStep('reveal',{...fresh,submitted:true})).toBe(true);
 expect(canOpenPracticeStep('reveal',{...fresh,patternGuess:'Arrays & Hashing',complexityGuess:'n'})).toBe(true);
 expect(canOpenPracticeStep('log',fresh)).toBe(true);
});
test('problems without a complexity bet require only the pattern guess',()=>{
 expect(canOpenPracticeStep('reveal',{...freshSession(),patternGuess:'Stack'},false)).toBe(true);
});