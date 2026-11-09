# Personal Library — Plan

> Save every article, video, or book you consume. When you can't remember something, just ask and it finds it in seconds.

## Goal
A read-it-later + knowledge library where everything saved is summarized, embedded, and searchable by natural-language questions with cited answers.

## Core features (MVP)
1. **Save anything** — paste a URL (article, YouTube video) or add a book manually (title, author, notes/highlights).
2. **Auto-ingest** — fetch article text / YouTube transcript, extract title, source, thumbnail; Claude writes a summary + key ideas.
3. **Library views** — Home ("Continue exploring", Collections, Recently saved), Articles, Videos, Books, Notes tabs.
4. **Collections** — user-defined groups with cover color and item count.
5. **Ask your library** — question box → semantic search over chunks → Claude answers with key ideas and links to the source items.
6. **Notes** — personal notes attached to items or standalone.

## Later
- Browser extension / share-sheet for one-click save.
- Kindle/Readwise highlight import.
- Spaced-repetition resurfacing of key ideas.

## Stack
| Layer | Choice |
|---|---|
| App | Next.js + TypeScript + Tailwind + shadcn/ui (warm editorial theme, serif headings) |
| Auth/DB | Supabase (Auth, Postgres + `pgvector`) |
| Ingest | `@mozilla/readability` + `jsdom` for articles; YouTube transcript fetch |
| AI | Claude API (`claude-haiku-5-5` summaries, `claude-sonnet-5-5` answers); embeddings via Voyage AI |
| Hosting | Vercel |

## Data model
- `items(id, user_id, type[article|video|book|note], url, title, source, author, thumbnail, summary, key_ideas jsonb, saved_at)`
- `chunks(id, item_id, content, embedding vector)`
- `collections(id, user_id, name, color)` + `collection_items(collection_id, item_id)`
- `questions(id, user_id, question, answer_md, cited_item_ids)`

## Milestones
1. **Setup** — scaffold, theme, top nav + hero layout.
2. **Save + ingest** — URL save, readability/transcript extraction, summary job.
3. **Library UI** — cards grid, type tabs, collections.
4. **RAG** — chunking, embeddings, `match_chunks` SQL function, ask endpoint, answer panel with citations.
5. **Polish** — notes, search, deploy.

## Risks
- Paywalled / JS-heavy pages fail to extract → allow manual paste of text.
- YouTube transcripts unavailable for some videos → fall back to title/description only.
