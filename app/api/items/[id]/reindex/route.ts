import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { indexItem } from "@/lib/index-item";

// Embeds an item's body text into `chunks` so it becomes searchable by /api/ask.
// Needed for items inserted directly via SQL (e.g. supabase/seed-resources.sql), which have
// no embeddings yet since seeding runs outside the app (no VOYAGE_API_KEY at SQL-editor time).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: item } = await supabase.from("items").select("id, body, user_id").eq("id", id).single();
  if (!item || item.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!item.body) return NextResponse.json({ error: "Nothing to index" }, { status: 400 });

  await supabase.from("chunks").delete().eq("item_id", id);
  await indexItem(supabase, id, item.body);

  return NextResponse.json({ ok: true });
}
