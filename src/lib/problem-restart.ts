import { freshSession } from './practice';
export function restartProblem(storage: Pick<Storage, 'removeItem'>, sessionKey: string) {
  storage.removeItem(`pp-flow-${sessionKey}`);
  storage.removeItem(`pp-bug-${sessionKey}`);
  return freshSession();
}