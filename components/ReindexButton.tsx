"use client";

import { useState } from "react";

export default function ReindexButton({ itemId }: { itemId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function run() {
    setState("busy");
    const res = await fetch(`/api/items/${itemId}/reindex`, { method: "POST" });
    setState(res.ok ? "done" : "idle");
  }

  return (
    <button onClick={run} disabled={state !== "idle"} className="text-xs text-accent hover:underline">
      {state === "busy" ? "Indexing…" : state === "done" ? "Indexed ✓" : "Index for search"}
    </button>
  );
}
