import { describe, expect, it } from "vitest";
import { drawWaitingQuestion } from "./waiting-questions";

function storage() {
  let value: string | null = null;
  return { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
}

describe("Shuffled waiting questions", () => {
  it("draws all eight questions once and never repeats after exhaustion", () => {
    const store = storage();
    const draws = Array.from({ length: 8 }, () => drawWaitingQuestion(8, store, () => 0.6));
    expect(new Set(draws).size).toBe(8);
    expect(draws[0]).toBe(4);
    expect(drawWaitingQuestion(8, store)).toBeNull();
  });
  it("keeps history across separate waiting panels", () => {
    const store = storage();
    expect(drawWaitingQuestion(8, store, () => 0)).toBe(0);
    expect(drawWaitingQuestion(8, store, () => 0)).toBe(1);
  });
});