import type { Breakdown } from "./types";

export type SavedProblem = {
  id: string;
  title: string;
  problem_text: string;
  pattern: string;
  difficulty: string;
  confidence: number;
  intuition?: number;
  breakdown: Breakdown;
  created_at: string;
};

const KEY = "pp-problem-log";

export function listProblems(): SavedProblem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedProblem[];
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
