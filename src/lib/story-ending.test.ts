import { describe, expect, it } from 'vitest';
import { storyWithEnding } from './story-ending';
import type { Breakdown } from './types';
const b: Breakdown = {
 title:'Two Sum', difficulty:'Easy', understand:{restatement:'Find a pair',inputs:'numbers',outputs:'indices',constraints:[],clarifying_questions:[]}, examples:[],
 pattern:{name:'Arrays & Hashing',why:'The notebook represents a hash map storing values and indices.',recognize:'Look for a complement.'},
 approach:{brute_force:'',brute_force_pseudocode:'',optimized:'Use a hash map to store each value and index, and look up target minus current.',optimized_pseudocode:''},
 solution:{python:'',java:'',javascript:''},complexity:{time:'O(n)',space:'O(n)',explanation:'',follow_ups:[]},visualization:{kind:'none',frames:[]},
 story:{title:'Coin quest',scenes:[{caption:'The coins unlock the gate.',actors:[],question:null}]}
};
describe('story solution ending',()=>{
 it('appends solution and data structure explanation to narration without altering saved story',()=>{
  const story=storyWithEnding(b);
  expect(story?.scenes).toHaveLength(2);
  expect(story?.scenes[1]?.caption).toContain('hash map to store each value and index');
  expect(story?.scenes[1]?.caption).toContain('O(n)');
  expect(b.story?.scenes).toHaveLength(1);
 });
 it('preserves older problems without a story',()=>{const { story, ...withoutStory } = b; expect(storyWithEnding(withoutStory)).toBeNull(); expect(story).toBeDefined();});
});
