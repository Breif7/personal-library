"use client";

import { useState } from "react";
import Link from "next/link";

type CitedItem = { id: string; title: string; url: string | null; type: string };

export default function AskLibrary() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [items, setItems] = useState<CitedItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not answer that");
      setAnswer(data.answer);
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={ask} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your library anything…"
          className="input"
        />
        <button disabled={busy} className="bg-forest text-white rounded-lg px-4 py-2 text-sm font-medium shrink-0">
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {answer && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm whitespace-pre-wrap">{answer}</p>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {items.map((it) => (
                <Link key={it.id} href={`/items/${it.id}`} className="text-xs bg-bg rounded-full px-3 py-1 hover:underline">
                  {it.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
