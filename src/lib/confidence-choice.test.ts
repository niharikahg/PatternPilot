import {expect,test} from 'vitest';
import {hasChosenConfidence} from './confidence-choice';
test('saving requires a chosen confidence from one to five, never a default',()=>{
 expect(hasChosenConfidence(null)).toBe(false);
 for(const value of [1,2,3,4,5]) expect(hasChosenConfidence(value)).toBe(true);
 for(const value of [0,6,2.5]) expect(hasChosenConfidence(value)).toBe(false);
});