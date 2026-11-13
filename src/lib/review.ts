export type ReviewPlan = { flagged_at: string; dates: string[]; completed: string[] };
export type PracticeStatus = "untried" | "solved" | "retry";
export function createReviewPlan(now = new Date()): ReviewPlan {
  const day = (days: number) => { const date = new Date(now); date.setDate(date.getDate() + days); return date.toISOString(); };
  const month = new Date(now);
  const originalDay = month.getDate();
  month.setDate(1); month.setMonth(month.getMonth() + 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  month.setDate(Math.min(originalDay, last));
  return { flagged_at: now.toISOString(), dates: [day(1), day(7), month.toISOString()], completed: [] };
}
export function nextReview(plan?: ReviewPlan) { return plan?.dates.find((date) => !plan.completed.includes(date)); }
export function isReviewDue(plan?: ReviewPlan, now = new Date()) { const date = nextReview(plan); return Boolean(date && new Date(date) <= now); }