import type { Breakdown } from "./types";

export function breakdownToMarkdown(b: Breakdown, lang: keyof Breakdown["solution"] = "python") {
  const ext = { python: "python", java: "java", javascript: "javascript" }[lang];
  return [
    `# ${b.title}`,
    `**Pattern:** ${b.pattern.name} · **Difficulty:** ${b.difficulty}`,
    `## 1. Understand`,
    b.understand.restatement,
    `- **Inputs:** ${b.understand.inputs}`,
    `- **Outputs:** ${b.understand.outputs}`,
    `**Constraints**`,
    ...b.understand.constraints.map((c) => `- ${c}`),
    `**Clarifying questions**`,
    ...b.understand.clarifying_questions.map((q) => `- ${q}`),
    `## 2. Examples`,
    ...b.examples.map((e, i) => `${i + 1}. \`${e.input}\` → \`${e.output}\` — ${e.explanation}`),
    `## 3. Pattern: ${b.pattern.name}`,
    b.pattern.why,
    `**Recognize it next time:** ${b.pattern.recognize}`,
    `## 4. Approach`,
    `**Brute force:** ${b.approach.brute_force}`,
    "```\n" + b.approach.brute_force_pseudocode + "\n```",
    `**Optimized:** ${b.approach.optimized}`,
    "```\n" + b.approach.optimized_pseudocode + "\n```",
    `## 5. Solution (${lang})`,
    "```" + ext + "\n" + b.solution[lang] + "\n```",
    `## 6. Complexity`,
    `- **Time:** ${b.complexity.time}`,
    `- **Space:** ${b.complexity.space}`,
    b.complexity.explanation,
    `**Follow-up questions**`,
    ...b.complexity.follow_ups.map((f) => `- ${f}`),
  ].join("\n\n");
}
