import Link from "next/link";

const TYPE_ICON: Record<string, string> = { article: "📰", video: "🎬", book: "📚", note: "📝" };

export type ItemSummary = {
  id: string;
  type: string;
  title: string;
  source: string | null;
  thumbnail: string | null;
  saved_at: string;
};

export default function ItemCard({ item }: { item: ItemSummary }) {
  return (
    <Link href={`/items/${item.id}`} className="card hover:border-accent transition block">
      {item.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnail} alt="" className="w-full h-28 object-cover rounded-lg mb-2" />
      )}
      <div className="text-xs text-gray-400 mb-1">
        {TYPE_ICON[item.type]} {item.type}
      </div>
      <div className="font-medium text-sm leading-snug line-clamp-2">{item.title}</div>
      <div className="text-xs text-gray-400 mt-1 truncate">
        {item.source ?? ""} · {new Date(item.saved_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
