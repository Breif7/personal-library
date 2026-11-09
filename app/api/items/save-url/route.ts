import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestUrl } from "@/lib/ingest";
import { summarize } from "@/lib/claude";
import { indexItem } from "@/lib/index-item";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  let ingested;
  try {
    ingested = await ingestUrl(url);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 });
  }

  const { summary, key_ideas } = await summarize(ingested.title, ingested.text).catch(() => ({
    summary: "",
    key_ideas: [] as string[],
  }));

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      type: ingested.type,
      url,
      title: ingested.title,
      source: ingested.source,
      author: ingested.author,
      thumbnail: ingested.thumbnail,
      summary,
      key_ideas,
      body: ingested.text,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await indexItem(supabase, item.id, ingested.text).catch(() => {});

  return NextResponse.json({ item });
}
