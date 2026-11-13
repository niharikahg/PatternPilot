import { describe, it, expect } from "vitest";
import { nextCombo, intuitionScore, opsFor, formatOps, linearPercent } from "./game";

describe("game", () => {
  it("formats one million squared as 1.0T ops",()=>expect(formatOps(opsFor("n^2",1_000_000))).toBe("1.0T"));
  it("uses a linear trillion-to-million comparison",()=>{expect(linearPercent(1_000_000,1_000_000_000_000)).toBeCloseTo(0.0001,8);expect(linearPercent(1_000_000_000_000,1_000_000_000_000)).toBe(100);});
  it("combo grows on correct answers", () => expect(nextCombo(2, true)).toBe(3));
  it("combo resets on a miss", () => expect(nextCombo(4, false)).toBe(0));
  it("intuition score is percent correct", () => expect(intuitionScore(3, 4)).toBe(75));
  it("intuition score is 0 with no attempts", () => expect(intuitionScore(0, 0)).toBe(0));
  it("n^2 at n=1000 is a million ops", () => expect(opsFor("n^2", 1000)).toBe(1_000_000));
});
