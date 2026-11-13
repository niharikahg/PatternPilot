import {expect,test} from 'vitest';
import {indentCode} from './editor-indent';
test('Tab inserts exactly four spaces and keeps the cursor in the editor',()=>{
 expect(indentCode('return True',0,0)).toEqual({code:'    return True',cursor:4});
});
test('Tab replaces only the selected range',()=>{
 expect(indentCode('abcxyz',3,6)).toEqual({code:'abc    ',cursor:7});
});