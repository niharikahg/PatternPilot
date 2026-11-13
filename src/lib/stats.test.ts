import { describe, it, expect } from "vitest";
import { weakestPatterns, patternBreakdown } from "./stats";

describe("stats", () => {
  const rows = [
    { pattern: "Stack", confidence: 5 },
    { pattern: "Stack", confidence: 4 },
    { pattern: "Greedy", confidence: 2 },
    { pattern: "Intervals", confidence: 2 },
    { pattern: "Intervals", confidence: 2 },
  ];
  it("averages confidence per pattern", () => {
    expect(patternBreakdown(rows).find((p) => p.pattern === "Stack")?.avgConfidence).toBe(4.5);
  });
  it("lists lowest-confidence patterns first", () => {
    expect(weakestPatterns(rows, 2).map((p) => p.pattern)).toEqual(["Greedy", "Intervals"]);
  });
});
