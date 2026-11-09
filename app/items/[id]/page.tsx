import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReindexButton from "@/components/ReindexButton";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("items").select("*").eq("id", id).single();
  if (!item) notFound();

  return (
    <article className="space-y-4 max-w-2xl">
      <div className="text-xs text-gray-400">
        {item.type} · {item.source ?? ""} {item.author ? `· ${item.author}` : ""}
      </div>
      <h1 className="font-serif text-3xl">{item.title}</h1>
      {item.url && (
        <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
          Open original ↗
        </a>
      )}

      {item.summary && (
        <div className="card">
          <h2 className="font-semibold text-sm mb-2">Summary</h2>
          <p className="text-sm text-gray-700">{item.summary}</p>
        </div>
      )}

      {Array.isArray(item.key_ideas) && item.key_ideas.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-sm mb-2">Key ideas</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {item.key_ideas.map((idea: string, i: number) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </div>
      )}

      {item.body && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm">Full text</h2>
            <ReindexButton itemId={item.id} />
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.body}</p>
        </div>
      )}
    </article>
  );
}
