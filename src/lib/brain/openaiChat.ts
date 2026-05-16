/** OpenAI-compatible chat completions for Night Guide (/api/brain/chat). */

export function resolveBrainOpenAIKey(): string | undefined {
  const brain = process.env.BRAIN_OPENAI_API_KEY?.trim();
  if (brain) return brain;
  return process.env.CURATOR_OPENAI_API_KEY?.trim() || undefined;
}

export function brainChatCompletionsUrl(): string {
  const base = (
    process.env.BRAIN_OPENAI_BASE_URL ||
    process.env.CURATOR_OPENAI_BASE_URL ||
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  return `${base}/chat/completions`;
}
