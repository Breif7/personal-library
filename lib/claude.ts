import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Summary = { summary: string; key_ideas: string[] };

/** Summarizes saved text into a short paragraph plus 3-5 key ideas. */
export async function summarize(title: string, text: string): Promise<Summary> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Summarize "${title}" in one short paragraph (under 60 words), then list 3-5 key ideas as short bullet points.
Reply with ONLY JSON: {"summary": string, "key_ideas": string[]}

Text:
${text.slice(0, 12000)}`,
      },
    ],
  });
  const raw = message.content.find((b) => b.type === "text")?.text ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return { summary: "", key_ideas: [] };
  return JSON.parse(match[0]);
}

/** Answers a question using retrieved chunks, citing which saved items it drew from. */
export async function answerFromChunks(
  question: string,
  chunks: { item_id: string; title: string; content: string }[]
) {
  const context = chunks
    .map((c, i) => `[${i + 1}] from "${c.title}" (item_id: ${c.item_id}):\n${c.content}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 700,
    messages: [
      {
        role: "user",
        content: `Answer the question using ONLY the excerpts below from the user's saved library. Cite sources inline like [1], [2]. If the excerpts don't answer it, say so.

Question: ${question}

Excerpts:
${context}`,
      },
    ],
  });
  return message.content.find((b) => b.type === "text")?.text ?? "";
}
