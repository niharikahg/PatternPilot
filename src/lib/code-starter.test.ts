import {expect,test} from 'vitest';
import {codeStarter} from './code-starter';
test('Python starter contains the function signature, never the solution body',()=>{
 expect(codeStarter('def two_sum(nums, target):\n    seen = {}\n    return seen','python')).toBe('def two_sum(nums, target):\n    ');
});
test('Java and JavaScript starters preserve arguments without implementation',()=>{
 expect(codeStarter('function solve(nums) { return nums; }','javascript')).toBe('function solve(nums) {\n    \n}');
 expect(codeStarter('class Solution { public int solve(int[] nums) { return 42; }}','java')).toBe('class Solution {\n    public int solve(int[] nums) {\n        \n    }\n}');
});