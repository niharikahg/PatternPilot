import { describe, expect, it } from "vitest";
import { sceneAtProgress, storyTimeline } from "./story-playback";
import type { Story } from "./types";
const story: Story = { title: "Journey", scenes: [
  { caption: "One two", actors: [], question: null },
  { caption: "Three four five six", actors: [], question: { prompt: "Why?", options: ["A", "B"], answer: 1, hint: "Think" } },
] };
describe("continuous story playback", () => {
  it("weights scene transitions by spoken words", () => {
    expect(storyTimeline(story)).toEqual([{ start: 0, end: 1 / 3 }, { start: 1 / 3, end: 1 }]);
  });
  it("advances through question scenes without waiting for answers", () => {
    expect(sceneAtProgress(story, 0)).toBe(0);
    expect(sceneAtProgress(story, 0.5)).toBe(1);
    expect(sceneAtProgress(story, 1)).toBe(1);
  });
});
