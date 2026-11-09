"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={sendLink} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-serif text-xl">🪺 Personal Library</h1>
        <p className="text-sm text-gray-500">Everything you save, always at hand.</p>
        {sent ? (
          <p className="text-sm text-forest">Check your email for a sign-in link.</p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <button className="w-full bg-accent text-white rounded-lg py-2 text-sm font-medium">
              Send magic link
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}
