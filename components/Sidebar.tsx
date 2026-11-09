import Link from "next/link";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/items?type=article", label: "Articles", icon: "📰" },
  { href: "/items?type=video", label: "Videos", icon: "🎬" },
  { href: "/items?type=book", label: "Books", icon: "📚" },
  { href: "/items?type=note", label: "Notes", icon: "📝" },
  { href: "/collections", label: "Collections", icon: "🗂️" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border p-4 hidden sm:block">
      <div className="font-serif text-lg mb-6 px-2">🪺 Library</div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-forest transition"
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
