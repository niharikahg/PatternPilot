import { expect, test } from 'vitest';
import { restartProblem } from './problem-restart';
test('restart clears only the active flow and bug attempt and restores fresh locked practice', () => {
  const rows = new Map([
    ['pp-flow-Valid Anagram', 'old guesses'], ['pp-bug-Valid Anagram', 'old draft'],
    ['pp-flow-Two Sum', 'other session'], ['pp-problem-log', 'saved outcomes'],
    ['pp-breakdown-cache-v2', 'cached content'],
  ]);
  const next = restartProblem({ removeItem: key => { rows.delete(key); } }, 'Valid Anagram');
  expect([...rows.entries()]).toEqual([
    ['pp-flow-Two Sum', 'other session'], ['pp-problem-log', 'saved outcomes'],
    ['pp-breakdown-cache-v2', 'cached content'],
  ]);
  expect(next).toEqual({step:'understand',submitted:false,early:false,xp:0,rewards:[],correct:0,attempts:0,combo:0});
});