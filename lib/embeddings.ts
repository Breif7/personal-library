// Voyage AI embeddings (Anthropic's recommended embedding provider). voyage-3 returns 1024-dim
// vectors, matching the `chunks.embedding` column in supabase/schema.sql.
export async function embed(texts: string[], inputType: "document" | "query"): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model: "voyage-3", input_type: inputType }),
  });
  if (!res.ok) throw new Error(`Voyage API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}

/** Splits text into ~1000-character chunks on paragraph boundaries where possible. */
export function chunkText(text: string, maxLen = 1000): string[] {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxLen && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}
