import { expect, test } from 'vitest';
import { optimalitySchema, optimalityScore, type Optimality } from './optimality';
const assessment: Optimality = {time_gap:'optimal',space_gap:'optimal',optimal_time:'O(n)',optimal_space:'O(n)',rationale:'Best defensible trade-off',steps:[{question:'What repeats?',action:'Trace the repeated work.'}]};
test('correct optimal solution scores 100 while correct slower solutions score less',()=>{
 expect(optimalityScore('Looks correct',assessment)?.total).toBe(100);
 expect(optimalityScore('Looks correct',{...assessment,time_gap:'major'})?.total).toBe(75);
});
test('incorrect efficient solutions cannot receive correctness credit',()=>{
 expect(optimalityScore('Needs work',assessment)).toEqual({total:50,correctness:0,time:35,space:15});
});
test('uncertain assessments do not fabricate a numerical score',()=>{
 expect(optimalityScore('Unclear',assessment)).toBeNull();
 expect(optimalityScore('Looks correct',{...assessment,time_gap:'unknown'})).toBeNull();
});
test('coaching requires bounded nonempty steps and rejects invalid evidence',()=>{
 expect(optimalitySchema.safeParse({...assessment,steps:[]}).success).toBe(false);
 expect(optimalitySchema.safeParse({...assessment,time_gap:'perfect'}).success).toBe(false);
});