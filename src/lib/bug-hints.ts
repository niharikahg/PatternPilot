// Local prompts direct attention without disclosing the fix or making another AI call.
export function bugFirstHint(code: string): string {
  if (/counts\[char\]\s*-=/.test(code)) return 'What happens to leftover counts after the second string ends?';
  if (/if partner:/.test(code)) return 'Is every possible index treated the same by this condition?';
  if (/stack\.pop/.test(code)) return 'What might still be waiting when the input ends?';
  if (/range\(|while |\[[^\]]*:-?1\]/.test(code)) return 'Look at the loop boundaries. Does every necessary item get visited?';
  if (/best = 0/.test(code)) return 'What assumption does the initial best value make about the input?';
  if (/merged\[-1\]/.test(code)) return 'Could a later item make an earlier result smaller?';
  return 'Trace the last decision before returning. What condition has not been checked yet?';
}