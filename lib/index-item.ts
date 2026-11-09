import { SupabaseClient } from "@supabase/supabase-js";
import { chunkText, embed } from "@/lib/embeddings";

/** Chunks an item's text, embeds each chunk, and stores them for semantic search. */
export async function indexItem(supabase: SupabaseClient, itemId: string, text: string) {
  if (!text.trim()) return;
  const pieces = chunkText(text);
  const vectors = await embed(pieces, "document");
  const rows = pieces.map((content, i) => ({ item_id: itemId, content, embedding: vectors[i] }));
  await supabase.from("chunks").insert(rows);
}
