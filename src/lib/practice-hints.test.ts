import {expect,test} from 'vitest';
import {hintContent} from './practice-hints';
test('first hint exposes only the failing input, never the explanation',()=>{
 expect(hintContent(1,"s='ab', t='a'")).toEqual({input:"s='ab', t='a'",explanation:false});
});
test('second hint permits the full explanation',()=>{
 expect(hintContent(2,"s='ab', t='a'").explanation).toBe(true);
});
test('legacy reviews use challenge input without revealing the solution',()=>{
 expect(hintContent(1,undefined,"s='ab', t='a'")).toEqual({input:"s='ab', t='a'",explanation:false});
});