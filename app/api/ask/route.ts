import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/embeddings";
import { answerFromChunks } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "question is required" }, { status: 400 });

  const [queryVector] = await embed([question], "query");
  const { data: matches, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryVector,
    match_user_id: user.id,
    match_count: 8,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!matches?.length) {
    return NextResponse.json({
      answer: "Nothing saved yet matches that question — save a few articles, videos or notes first.",
      items: [],
    });
  }

  const itemIds = [...new Set(matches.map((m: any) => m.item_id))];
  const { data: items } = await supabase.from("items").select("id, title, url, type").in("id", itemIds);
  const titleById = new Map((items ?? []).map((i) => [i.id, i.title]));

  const answer = await answerFromChunks(
    question,
    matches.map((m: any) => ({ item_id: m.item_id, title: titleById.get(m.item_id) ?? "Untitled", content: m.content }))
  );

  await supabase.from("questions").insert({
    user_id: user.id,
    question,
    answer_md: answer,
    cited_item_ids: itemIds,
  });

  return NextResponse.json({ answer, items: items ?? [] });
}
