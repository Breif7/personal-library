import { createClient } from "@/lib/supabase/server";
import NewCollectionForm from "@/components/NewCollectionForm";
import Link from "next/link";

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, color, collection_items(count)")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Collections</h1>
      <NewCollectionForm />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(collections ?? []).map((c) => (
          <Link key={c.id} href={`/collections/${c.id}`} className="card block" style={{ borderLeft: `4px solid ${c.color}` }}>
            <div className="font-medium text-sm">{c.name}</div>
            <div className="text-xs text-gray-400 mt-1">{(c as any).collection_items?.[0]?.count ?? 0} items</div>
          </Link>
        ))}
        {!collections?.length && <p className="text-sm text-gray-400 col-span-full">No collections yet.</p>}
      </div>
    </div>
  );
}
