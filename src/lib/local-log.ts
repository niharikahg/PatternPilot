import { PATTERNS, type Breakdown, type Pattern } from "./types";
import type { PracticeStatus, ReviewPlan } from "./review";

export type SavedProblem = {
  id: string;
  title: string;
  problem_text: string;
  pattern: string;
  difficulty: string;
  confidence: number;
  intuition?: number | undefined;
  breakdown: Breakdown;
  created_at: string;
  practice_status?: PracticeStatus;
  review?: ReviewPlan | undefined;
  code_attempt?: { language: string; code: string; feedback?: string | undefined };
};

const KEY = "pp-problem-log";

export function listProblems(): SavedProblem[] {
  try {
    const rows=JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedProblem[];
    return rows.map(row=>{ const title=row.title.toLowerCase();const name:Pattern=title.includes('atoi')||title.includes('string to integer')?'String Parsing':title.includes('reverse integer')?'Math & Bit Manipulation':row.pattern==='Hash Map'?'Arrays & Hashing':row.pattern==='BFS / DFS'?'Graphs':PATTERNS.includes(row.pattern as Pattern)?row.pattern as Pattern:'Arrays & Hashing';return {...row,pattern:name,breakdown:{...row.breakdown,pattern:{...row.breakdown.pattern,name}}}; });
  } catch {
    return [];
  }
}
function write(rows: SavedProblem[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}
export function getProblem(id: string) {
  return listProblems().find((p) => p.id === id) ?? null;
}
export function addProblem(p: Omit<SavedProblem, "id" | "created_at">) {
  const row = { ...p, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  write([row, ...listProblems()]);
  return row.id;
}
export function updateProblem(id: string, patch: Partial<SavedProblem>) {
  write(listProblems().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function deleteProblem(id: string) {
  write(listProblems().filter((p) => p.id !== id));
}
