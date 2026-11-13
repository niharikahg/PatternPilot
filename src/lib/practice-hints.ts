export function hintContent(level: number, failingInput: string | undefined, fallbackInput?: string) {
  return { input: level > 0 ? failingInput || fallbackInput || null : null, explanation: level >= 2 };
}