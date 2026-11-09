import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ItemCard from "@/components/ItemCard";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase.from("collections").select("*").eq("id", id).single();
  if (!collection) notFound();

  const { data: rows } = await supabase
    .from("collection_items")
    .select("items(id, type, title, source, thumbnail, saved_at)")
    .eq("collection_id", id);
  const items = (rows ?? []).map((r: any) => r.items).filter(Boolean);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl" style={{ borderLeft: `4px solid ${collection.color}`, paddingLeft: 12 }}>
        {collection.name}
      </h1>
      {items.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No items in this collection yet.</p>
      )}
    </div>
  );
}
