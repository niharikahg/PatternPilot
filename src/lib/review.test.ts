import { describe, expect, it } from "vitest";
import { createReviewPlan, isReviewDue, nextReview } from "./review";
describe("spaced review", () => {
  const date = new Date("2026-11-13T10:00:00Z");
  it("schedules first reminder one day after flagging", () => { expect(createReviewPlan(date).dates[0]).toBe("2026-11-14T10:00:00.000Z"); });
  it("schedules second reminder seven days after flagging", () => { expect(createReviewPlan(date).dates[1]).toBe("2026-11-20T10:00:00.000Z"); });
  it("schedules third reminder one calendar month after flagging", () => { expect(createReviewPlan(date).dates[2]).toBe("2026-12-13T10:00:00.000Z"); });
  it("clamps month-end dates", () => { expect(createReviewPlan(new Date("2026-01-31T10:00:00Z")).dates[2]).toBe("2026-02-28T10:00:00.000Z"); });
  it("keeps overdue reviews until completed", () => { const plan = createReviewPlan(date); expect(isReviewDue(plan, new Date("2026-11-14T09:59:00Z"))).toBe(false); expect(isReviewDue(plan, new Date("2026-11-14T10:00:00Z"))).toBe(true); plan.completed.push(plan.dates[0] ?? ""); expect(nextReview(plan)).toBe(plan.dates[1]); });
});