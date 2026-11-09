import { createClient } from "@/lib/supabase/server";
import SaveBar from "@/components/SaveBar";
import AskLibrary from "@/components/AskLibrary";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: recent }, { data: collections }] = await Promise.all([
    supabase.from("items").select("id, type, title, source, thumbnail, saved_at").order("saved_at", { ascending: false }).limit(8),
    supabase.from("collections").select("id, name, color, collection_items(count)").order("name"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl mb-1">Everything you save, always at hand.</h1>
        <p className="text-sm text-gray-500 mb-4">Save articles, videos and books. Ask, and find it in seconds.</p>
        <SaveBar />
      </div>

      <AskLibrary />

      {!!collections?.length && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl">Collections</h2>
            <Link href="/collections" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="card block"
                style={{ borderLeft: `4px solid ${c.color}` }}
              >
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {(c as any).collection_items?.[0]?.count ?? 0} items
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl mb-3">Continue exploring</h2>
        {recent?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recent.map((item) => (
              <ItemCard key={item.id} item={item as any} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nothing saved yet — paste a link above to get started.</p>
        )}
      </div>
    </div>
  );
}
