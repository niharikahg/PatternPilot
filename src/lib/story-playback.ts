import type { Story } from "./types";

export function storyTimeline(story: Story) {
  const weights = story.scenes.map((scene) => Math.max(1, scene.caption.trim().split(/\s+/).length));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let elapsed = 0;
  return weights.map((weight) => {
    const start = elapsed / total;
    elapsed += weight;
    return { start, end: elapsed / total };
  });
}

export function sceneAtProgress(story: Story, progress: number) {
  const timeline = storyTimeline(story);
  const index = timeline.findIndex((scene) => progress < scene.end);
  return index < 0 ? Math.max(0, timeline.length - 1) : index;
}