export const PATTERNS = [
  "Hash Map",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "BFS/DFS",
  "Dynamic Programming",
  "Greedy",
  "Intervals",
] as const;
export type Pattern = (typeof PATTERNS)[number];
export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Frame = {
  cells: string[];
  grid: string[][];
  highlight: { row: number; col: number }[];
  pointers: { name: string; row: number; col: number }[];
  vars: { name: string; value: string }[];
  note: string;
};

export type Breakdown = {
  title: string;
  difficulty: Difficulty;
  understand: {
    restatement: string;
    inputs: string;
    outputs: string;
    constraints: string[];
    clarifying_questions: string[];
  };
  examples: { input: string; output: string; explanation: string }[];
  pattern: { name: Pattern; why: string; recognize: string };
  approach: {
    brute_force: string;
    brute_force_pseudocode: string;
    optimized: string;
    optimized_pseudocode: string;
  };
  solution: { python: string; java: string; javascript: string };
  complexity: { time: string; space: string; explanation: string; follow_ups: string[] };
  story?: Story;
  complexity_lab?: ComplexityLab;
  visualization: { kind: "array" | "string" | "linked_list" | "grid" | "none"; frames: Frame[] };
};


export type Actor = { id: string; label: string; emoji: string; x: number; y: number; state: "idle" | "active" | "done" | "faded" };
export type StoryScene = {
  caption: string;
  actors: Actor[];
  question: { prompt: string; options: string[]; answer: number; hint: string } | null;
};
export type Story = { title: string; scenes: StoryScene[] };
export type ComplexityLab = {
  brute_force_time: import("./game").Growth;
  optimized_time: import("./game").Growth;
  optimized_space: import("./game").Growth;
  code_hotspots: { line: number; runs: string; why: string }[];
};
