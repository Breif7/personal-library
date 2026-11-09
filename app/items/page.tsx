import { createClient } from "@/lib/supabase/server";
import ItemCard from "@/components/ItemCard";
import SaveBar from "@/components/SaveBar";
import NewManualItemForm from "@/components/NewManualItemForm";

const TABS = [
  { type: "article", label: "Articles" },
  { type: "video", label: "Videos" },
  { type: "book", label: "Books" },
  { type: "note", label: "Notes" },
];

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const activeType = type && TABS.some((t) => t.type === type) ? type : "article";
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("items")
    .select("id, type, title, source, thumbnail, saved_at")
    .eq("type", activeType)
    .order("saved_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">My library</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <a
            key={t.type}
            href={`/items?type=${t.type}`}
            className={`text-sm px-3 py-1.5 rounded-full ${
              activeType === t.type ? "bg-forest text-white" : "bg-panel border border-border text-gray-600"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {activeType === "article" || activeType === "video" ? (
        <SaveBar />
      ) : (
        <NewManualItemForm type={activeType as "book" | "note"} />
      )}

      {items?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item as any} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Nothing here yet.</p>
      )}
    </div>
  );
}
