"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewManualItemForm({ type }: { type: "book" | "note" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, author, body }),
      });
      setTitle("");
      setAuthor("");
      setBody("");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
        + Add {type}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input" required />
      {type === "book" && (
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="input" />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={type === "book" ? "Notes / highlights" : "Write your note…"}
        className="input min-h-28"
      />
      <div className="flex gap-2">
        <button disabled={saving} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
