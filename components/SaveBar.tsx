"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SaveBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/items/save-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save this link");
      setUrl("");
      router.push(`/items/${data.item.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste an article or YouTube link to save…"
        className="input"
      />
      <button disabled={busy} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium shrink-0">
        {busy ? "Saving…" : "Save"}
      </button>
      {error && <p className="text-xs text-red-600 absolute mt-10">{error}</p>}
    </form>
  );
}
