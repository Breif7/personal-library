import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { summarize } from "@/lib/claude";
import { indexItem } from "@/lib/index-item";

// Manual entries: books (title/author/notes) and standalone notes.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, title, author, body } = await req.json();
  if (!["book", "note"].includes(type) || !title) {
    return NextResponse.json({ error: "type (book|note) and title are required" }, { status: 400 });
  }

  const { summary, key_ideas } = body
    ? await summarize(title, body).catch(() => ({ summary: "", key_ideas: [] as string[] }))
    : { summary: "", key_ideas: [] as string[] };

  const { data: item, error } = await supabase
    .from("items")
    .insert({ user_id: user.id, type, title, author, body, summary, key_ideas })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body) await indexItem(supabase, item.id, body).catch(() => {});

  return NextResponse.json({ item });
}
