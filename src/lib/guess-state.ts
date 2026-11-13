export function guessState(option: string, selected: string | undefined | null, correct: string): 'correct' | 'wrong' | 'selected' | 'idle' {
  if (!selected) return 'idle';
  if (option === correct) return 'correct';
  if (option === selected) return 'wrong';
  return 'idle';
}