"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const COLORS = ["#c2410c", "#1f3d2b", "#1d4ed8", "#a16207", "#be185d"];

export default function NewCollectionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      setName("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name…" className="input flex-1" />
      <div className="flex gap-1">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full ${color === c ? "ring-2 ring-offset-1 ring-forest" : ""}`}
            style={{ background: c }}
          />
        ))}
      </div>
      <button disabled={saving} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
        + Create
      </button>
    </form>
  );
}
