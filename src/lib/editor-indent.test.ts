import {expect,test} from 'vitest';
import {indentCode,newlineCode} from './editor-indent';
test('Tab inserts exactly four spaces and keeps the cursor in the editor',()=>{
 expect(indentCode('return True',0,0)).toEqual({code:'    return True',cursor:4});
});
test('Tab replaces only the selected range',()=>{
 expect(indentCode('abcxyz',3,6)).toEqual({code:'abc    ',cursor:7});
});
test('Enter keeps the current four-space indentation',()=>{
 expect(newlineCode('    return True',15,15,'python')).toEqual({code:'    return True\n    ',cursor:20});
});
test('Python Enter adds four spaces after a colon',()=>{
 expect(newlineCode('    if ok:',10,10,'python')).toEqual({code:'    if ok:\n        ',cursor:19});
});