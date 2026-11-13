import {expect,test} from 'vitest';
import {LIBRARY} from './library';
test('target-search preset does not name Binary Search or logarithmic time',()=>{
 const target=LIBRARY[9];
 expect(target?.title).toBe('Find the Target');
 expect(`${target?.title} ${target?.text}`).not.toMatch(/binary search|O\(log n\)/i);
});
test('product preset does not give away the linear time requirement',()=>{
 expect(LIBRARY[11]?.text).not.toContain('O(n)');
});
