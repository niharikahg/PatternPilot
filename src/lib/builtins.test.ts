import {expect,test} from 'vitest';
import {LIBRARY} from './library';
import {builtinAudio,builtinBreakdown} from './builtins';
import {builtinBug} from './builtin-bugs';
test('all sixteen presets have a full instant breakdown and narration',()=>{
 expect(LIBRARY).toHaveLength(16);
 for(const preset of LIBRARY){
  const b=builtinBreakdown(preset.text);
  expect(b?.title).toBe(preset.title);
  expect(b?.solution.python.length).toBeGreaterThan(20);
  expect(builtinAudio(b?.title??'')).toMatch(/^(https:\/\/|\/__l5e\/assets-v1\/).+\.mp3$/);
 }
});
test('all sixteen first bug puzzles are instant and omit runner imports',()=>{
 for(const preset of LIBRARY){
  const bug=builtinBug(preset.title);
  expect(bug?.code.length).toBeGreaterThan(10);
  expect(bug?.code).not.toMatch(/import\s+(json|sys)/);
  expect(bug?.expected_output.length).toBeGreaterThan(0);
 }
});
test('Find the Target understanding does not reveal logarithmic complexity',()=>{
 const b=builtinBreakdown(LIBRARY[9]?.text??'');
 expect(JSON.stringify(b?.understand)).not.toMatch(/O\(log n\)|binary search/i);
});