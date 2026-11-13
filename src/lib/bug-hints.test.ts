import { expect, test } from 'vitest';
import { bugFirstHint } from './bug-hints';
import bugs from './practice-data/bugs.json';
test('anagram debugging hint directs attention to leftover counts instead of repeating input', () => {
  const puzzle = bugs.find(bug => bug.title === 'Valid Anagram');
  if (!puzzle) throw new Error('Missing anagram puzzle');
  expect(bugFirstHint(puzzle.code)).toBe('What happens to leftover counts after the second string ends?');
  expect(bugFirstHint(puzzle.code)).not.toContain(puzzle.failing_input);
});