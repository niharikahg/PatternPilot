import {expect,test} from 'vitest';
import {stringInputs} from './visual-inputs';
test('both anagram strings become separate input tile rows',()=>{
 expect(stringInputs('s = "abba", t = "baba"')).toEqual([{name:'s',cells:['a','b','b','a']},{name:'t',cells:['b','a','b','a']}]);
});
test('unequal and empty string inputs retain their actual lengths',()=>{
 expect(stringInputs("s='ab', t='' ")).toEqual([{name:'s',cells:['a','b']},{name:'t',cells:[]}]);
});