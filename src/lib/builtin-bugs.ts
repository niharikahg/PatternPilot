import puzzles from './practice-data/bugs.json';
export function builtinBug(title: string) {
  return puzzles.find(puzzle => puzzle.title === title) ?? null;
}