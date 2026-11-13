import { describe, expect, it } from "vitest";
import { drawWaitingQuestion } from "./waiting-questions";

function storage() {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
}

describe("Shuffled waiting questions", () => {
  it("continues beyond eight questions with unique examples", () => {
    const store = storage();
    const draws = Array.from({ length: 1000 }, () => drawWaitingQuestion(store, () => 0.6));
    expect(new Set(draws.map((question) => question.prompt)).size).toBe(1000);
    expect(new Set(draws.slice(0, 8).map((question) => question.tipIndex)).size).toBe(8);
    expect(draws.every((q) => q.answer >= 0 && q.answer < q.options.length)).toBe(true);
  });
  it("keeps history across separate waiting panels", () => {
    const store = storage();
    const first = drawWaitingQuestion(store, () => 0);
    const second = drawWaitingQuestion(store, () => 0);
    expect(first.tipIndex).toBe(0);
    expect(second.tipIndex).toBe(1);
    expect(first.id).not.toBe(second.id);
  });
});