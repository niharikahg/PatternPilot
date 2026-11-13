import type { Breakdown, Story } from "./types";

export function storyWithEnding(b: Breakdown): Story | null {
  if (!b.story?.scenes.length) return null;
  const last = b.story.scenes.at(-1);
  if (!last) return null;
  return {
    ...b.story,
    scenes: [...b.story.scenes, {
      actors: last.actors,
      question: null,
      caption: `Now turn the story into a solution. The pattern is ${b.pattern.name}. ${b.pattern.why} Here is how to solve the actual question: ${b.approach.optimized} The running time is ${b.complexity.time}, with ${b.complexity.space} extra space. To recognize a similar question next time: ${b.pattern.recognize}`,
    }],
  };
}