import { expect, test } from 'vitest';
import { guessState } from './guess-state';
test('wrong Two Pointers pick is wrong, not correct', () => {
  expect(guessState('Two Pointers', 'Two Pointers', 'Arrays & Hashing')).toBe('wrong');
});
test('correct hashing answer lights up after a wrong pick', () => {
  expect(guessState('Arrays & Hashing', 'Two Pointers', 'Arrays & Hashing')).toBe('correct');
});
test('wrong complexity bet highlights the true linear complexity', () => {
  expect(guessState('n', 'nlogn', 'n')).toBe('correct');
  expect(guessState('nlogn', 'nlogn', 'n')).toBe('wrong');
});