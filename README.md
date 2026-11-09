# Personal Library

Save every article, video or book you consume. When you can't remember something, just ask and it finds it in seconds.

![Concept](docs/concept.jpeg)

**Status:** MVP implemented, not yet run (no Node.js on the machine that built it — see Known issues). See [PLAN.md](PLAN.md) for the full feature list and milestones.

## Stack
Next.js 15 (App Router, TypeScript) · Tailwind · Supabase (Auth, Postgres + `pgvector`) · `@mozilla/readability` for article extraction · Voyage AI embeddings · Claude API (summaries + RAG answers) · Vercel.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project**, enable the `vector` extension (the schema does this for you), and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor — creates `items`, `chunks` (with a `match_chunks` similarity-search function), `collections` and `questions`, all RLS-protected.
3. **Get a Voyage AI key** at [voyageai.com](https://www.voyageai.com) (used for embeddings — free tier available) and an Anthropic key at console.anthropic.com.
4. **Enable email magic-link auth** in Supabase (on by default) and add `http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.
5. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, sign in, and paste a link to save your first item.

### Seeding a starter "Building my apps" collection
[`supabase/seed-resources.sql`](supabase/seed-resources.sql) pre-populates the library with reference notes for the stack used across all five apps in this workspace (Next.js, Supabase, Claude API, Auth.js/Google OAuth, pgvector/RAG, receipt OCR, Tiptap, etc.) so "ask your library" has something useful on day one. Replace `:user_id` with your Supabase auth user id (Authentication → Users), then run it in the SQL editor. It inserts directly as SQL (no embeddings yet, since seeding runs outside the app) — open each seeded item once and click **Index for search** to embed it so `/api/ask` can find it.

## Deploy
Push to GitHub (already done) → import into Vercel → set the same environment variables there.

## Known issues / not verified
- Built without a working Node.js install, so `npm install`/`npm run dev`/`npm run build` have **not been run** — there may be small type or import errors to fix on first build.
- YouTube videos are summarized from title/author only (no transcript fetch — documented as the fallback in PLAN.md's Risks section); answers about video content will be thin until a transcript source is added.
- The seed SQL inserts items without embeddings — click **Index for search** on each seeded item's page once the app is running (see above) so they become searchable.
- No automated tests yet.
