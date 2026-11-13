import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const narrateStory = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ captions: z.array(z.string().min(1).max(2000)).min(1).max(10) }).parse(input))
  .handler(async ({ data }) => {
    const { generateSpeech, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const audio = await generateSpeech({
        model: "google/gemini-3.1-flash-tts-preview",
        contents: [{ role: "user", parts: [{ text: `Read this mini-story as a warm, expressive storyteller. Use a natural pace, playful suspense and a short pause between paragraphs. Read only the story, no introduction.\n\n${data.captions.join("\n\n")}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } },
      });
      const blob = await audio.blob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return { base64: btoa(binary), contentType: audio.contentType };
    } catch (error) {
      if (error instanceof GatewayError) console.error("Story narration failed", error.code, error.ids);
      throw new Error("Narration isn’t available right now. You can still watch with captions.");
    }
  });