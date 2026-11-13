import {expect,test} from 'vitest';
import {reviewProblemContext} from './review-context';
import brackets from './practice-data/1.json';
test('bug review includes the six-bracket-only constraint and the supplied failing example',()=>{
 const context=reviewProblemContext('Valid Parentheses',brackets.understand.restatement,brackets.understand.constraints,"is_well_formed('(')",'False');
 expect(context).toContain('Only the six bracket characters appear.');
 expect(context).toContain("Debugging example input: is_well_formed('(')");
 expect(context).toContain('Expected output: False');
});