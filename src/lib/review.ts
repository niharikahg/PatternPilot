export type ReviewPlan = { flagged_at: string; dates: string[]; completed: string[] };
export type PracticeStatus = "untried" | "solved" | "retry";
export function createReviewPlan(now = new Date()): ReviewPlan {
  const day = (days: number) => { const date = new Date(now); date.setDate(date.getDate() + days); return date.toISOString(); };
  return { flagged_at: now.toISOString(), dates: [day(1), day(3), day(7)], completed: [] };
}
export function nextReview(plan?: ReviewPlan) { return plan?.dates.find((date) => !plan.completed.includes(date)); }
export function isReviewDue(plan?: ReviewPlan, now = new Date()) { const date = nextReview(plan); return Boolean(date && new Date(date) <= now); }