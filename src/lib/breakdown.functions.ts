import { createServerFn } from "@tanstack/react-start";
import { PATTERNS, type Breakdown } from "./types";

const str = { type: "string" } as const;
const strArr = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required: Object.keys(properties),
});
const cell = obj({ row: { type: "integer" }, col: { type: "integer" } });

const schema = obj({
  title: str,
  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
  understand: obj({
    restatement: str,
    inputs: str,
    outputs: str,
    constraints: strArr,
    clarifying_questions: strArr,
  }),
  examples: { type: "array", items: obj({ input: str, output: str, explanation: str }) },
  pattern: obj({ name: { type: "string", enum: [...PATTERNS] }, why: str, recognize: str }),
  approach: obj({
    brute_force: str,
    brute_force_pseudocode: str,
    optimized: str,
    optimized_pseudocode: str,
  }),
  solution: obj({ python: str, java: str, javascript: str }),
  complexity: obj({ time: str, space: str, explanation: str, follow_ups: strArr }),
  visualization: obj({
    kind: { type: "string", enum: ["array", "string", "linked_list", "grid", "none"] },
    frames: {
      type: "array",
      items: obj({
        cells: strArr,
        grid: { type: "array", items: strArr },
        highlight: { type: "array", items: cell },
        pointers: {
          type: "array",
          items: obj({ name: str, row: { type: "integer" }, col: { type: "integer" } }),
        },
        vars: { type: "array", items: obj({ name: str, value: str }) },
        note: str,
      }),
    },
  }),
});

const SYSTEM = `You are a senior software engineering interviewer coaching a career switcher or new grad.
Break the given coding interview problem into a structured 6-step framework. Be precise, plain-English, and concise.
Rules:
- understand: restate clearly; exactly 2 clarifying questions to ask the interviewer.
- examples: 2-3 test cases including at least one edge case.
- pattern.name must be one of: ${PATTERNS.join(", ")}.
- approach: describe brute force first, then the optimized approach, each with clear pseudocode.
- solution: clean, idiomatic, commented code for the optimized approach in Python, Java and JavaScript.
- complexity: Big-O with a plain-English explanation, plus 3 common interviewer follow-up questions.
- visualization: for array, string, linked list or grid problems, produce 5-10 frames tracing the optimized algorithm on the first example.
  For array/string/linked_list: put the elements in "cells" (one string per element/char/node), leave "grid" empty, use row=0 and col=index for highlight and pointers.
  For grid: put rows in "grid", leave "cells" empty, use row/col.
  "highlight" = elements being examined this step; "pointers" = named indices (e.g. i, left, prev, curr); "vars" = key variable values at that step; "note" = one sentence of what happens.
  Use kind "none" with empty frames for problems that don't fit these shapes.
Return JSON matching the schema.`;

type OutputItem = { type?: string; content?: { type?: string; text?: string }[] };

export const generateBreakdown = createServerFn({ method: "POST" })
  .inputValidator((input: { problem: string }) => {
    const problem = String(input?.problem ?? "").trim();
    if (problem.length < 10) throw new Error("Please paste a longer problem description.");
    if (problem.length > 8000) throw new Error("Problem text is too long (8000 characters max).");
    return { problem };
  })
  .handler(async ({ data }): Promise<Breakdown> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        reasoning: { effort: "low" },
        input: [{ role: "user", content: `Problem:\n${data.problem}\n\nReturn JSON.` }],
        text: { format: { type: "json_schema", name: "breakdown", strict: true, schema } },
      });
      const output = ((res as unknown as { output?: OutputItem[] }).output ?? []);
      const text = output
        .filter((o) => o.type === "message")
        .flatMap((o) => o.content ?? [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text ?? "")
        .join("");
      if (!text) throw new Error("The AI returned an empty response. Please try again.");
      return JSON.parse(text) as Breakdown;
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("AI gateway error", e.code, e.httpStatus);
        if (e.httpStatus === 429) throw new Error("Too many requests right now. Please wait a moment and try again.");
        if (e.httpStatus === 402) throw new Error("AI credits are used up for this workspace.");
        throw new Error("The AI service couldn't generate a breakdown. Please try again.");
      }
      throw e;
    }
  });
