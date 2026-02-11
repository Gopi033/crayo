import OpenAI from "openai";

export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai/keys and add it to .env.local"
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });
}

export async function generateStory(
  prompt: string,
  options?: { wordCount?: number }
): Promise<string> {
  const client = getOpenRouterClient();

  const systemPrompt = `You are a creative storyteller specializing in short, engaging Reddit-style stories for TikTok and Instagram Reels. 
Write stories that:
- Start with a hook that grabs attention immediately
- Have a clear beginning, middle, and twist/conclusion
- Use first person perspective
- Feel authentic and relatable
- Cover topics like relationships, work, family, or unexpected situations
Do NOT include a title, subreddit name, or any formatting. Just write the story text directly.`;

  const maxTokens = options?.wordCount
    ? Math.ceil(options.wordCount * 1.5)
    : 500;

  const response = await client.chat.completions.create({
    model: "arcee-ai/trinity-large-preview:free",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM");
  }
  return content.trim();
}
