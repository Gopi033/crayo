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

export async function generateStory(prompt?: string): Promise<string> {
  const client = getOpenRouterClient();

  const systemPrompt = `You are a creative storyteller specializing in short, engaging Reddit-style stories for TikTok and Instagram Reels. 
Write stories that:
- Are 100-200 words long (perfect for 30-60 second videos)
- Start with a hook that grabs attention immediately
- Have a clear beginning, middle, and twist/conclusion
- Use first person perspective
- Feel authentic and relatable
- Cover topics like relationships, work, family, or unexpected situations
Do NOT include a title, subreddit name, or any formatting. Just write the story text directly.`;

  const userPrompt =
    prompt ||
    "Write me a short, engaging Reddit-style story with a surprising twist ending.";

  const response = await client.chat.completions.create({
    model: "deepseek/deepseek-r1-distill-llama-70b:free",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 500,
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM");
  }
  return content.trim();
}
