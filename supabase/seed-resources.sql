-- Seeds a "Building my apps" collection with reference material for the stack used across
-- the five apps in this workspace (day-board, receipt-accountant, personal-library,
-- daily-review-assistant, second-brain-ai). Run supabase/schema.sql first.
--
-- Replace :user_id below with your Supabase auth user id (Authentication → Users → copy the
-- UUID), e.g. in the Supabase SQL editor: \set user_id '00000000-0000-0000-0000-000000000000'
-- or just find-and-replace :user_id with the literal UUID before running.
--
-- Summaries/key ideas here are written for this workspace, not copied from the source docs.
-- After running this, open each item in the app and click "Index for search" to embed it.

with new_collection as (
  insert into collections (user_id, name, color)
  values (:user_id, 'Building my apps', '#1f3d2b')
  returning id
),
new_items as (
  insert into items (user_id, type, url, title, source, summary, key_ideas, body)
  values
    (
      :user_id, 'article', 'https://nextjs.org/docs', 'Next.js App Router docs', 'nextjs.org',
      'The framework every app in this workspace is built on: file-based routing, Server Components, and API routes under app/api.',
      '["Server Components fetch data directly, no client-side useEffect needed", "Route handlers in app/api/*/route.ts replace getServerSideProps-style APIs", "middleware.ts runs before a request reaches any page — used here for auth gating", "Dynamic segments like app/items/[id]/page.tsx receive params as a Promise in Next 15"]',
      'All five apps in this workspace (Day Board, Receipt Accountant, Personal Library, Daily Review Assistant, Second Brain AI) use the Next.js App Router: Server Components for data-fetching pages, small Client Components for interactive widgets, and app/api route handlers for anything that writes data or calls an external API (Claude, Google, Supabase). middleware.ts in each app is what redirects a signed-out visitor to /login.'
    ),
    (
      :user_id, 'article', 'https://supabase.com/docs/guides/auth/row-level-security', 'Supabase Row Level Security', 'supabase.com',
      'How every app here keeps one user from reading another user''s rows, even though they all share the same tables.',
      '["RLS policies run inside Postgres, not the app, so they hold even if app code has a bug", "A typical policy: using (auth.uid() = user_id) with check (auth.uid() = user_id)", "The service-role key bypasses RLS entirely — only use it in trusted server code (e.g. cron jobs)", "Day Board uses Google OAuth instead of Supabase Auth, so its tables skip RLS and filter by user_id in server code instead"]',
      'Receipt Accountant and Personal Library use Supabase Auth (magic links) with RLS policies like "own rows" on every table, so auth.uid() has to match user_id for any read/write. Day Board authenticates with Google via Auth.js instead, so its Supabase tables have no RLS and every query in lib/supabase.ts and the API routes manually filters by the signed-in user''s Google id.'
    ),
    (
      :user_id, 'article', 'https://supabase.com/docs/guides/storage', 'Supabase Storage', 'supabase.com',
      'Private file storage for receipt photos — buckets, storage policies, and signed URLs.',
      '["Buckets can be public or private; receipts should always be private", "Storage policies look like RLS but target storage.objects, keyed by a path prefix", "storage.foldername(name)[1] is the trick used here to scope files to user_id/filename", "createSignedUrl() generates a short-lived link so the browser can display a private image"]',
      'Receipt Accountant stores every uploaded photo in a private "receipts" bucket, under a path like <user_id>/<timestamp>-<filename>. Storage policies restrict read/write/delete to the folder matching the caller''s auth.uid(), and the review page fetches a 1-hour signed URL to display the image instead of making the bucket public.'
    ),
    (
      :user_id, 'article', 'https://docs.anthropic.com/en/api/messages', 'Claude Messages API', 'docs.anthropic.com',
      'The core API call behind every AI feature in this workspace: structured JSON extraction, summaries, and RAG answers.',
      '["A message can mix image and text content blocks in one request — used for receipt OCR", "Asking the model to reply with ONLY JSON (and regex-extracting the {...} block) is a simple, reliable pattern without needing tool-use schemas", "claude-haiku-5-5 is the cheap/fast choice for short summaries; claude-sonnet-5-5 for anything needing more reasoning (reports, RAG answers)", "max_tokens caps the reply length — keep it tight for structured extraction to control cost"]',
      'Receipt Accountant sends a receipt photo as an image block and asks for merchant/date/total/category as JSON. Personal Library summarizes saved articles the same way. Day Board''s morning brief and Daily Review Assistant''s nightly review both prompt Claude with the day''s structured data (events, tasks, habits) and ask for a short plain-text write-up.'
    ),
    (
      :user_id, 'article', 'https://authjs.dev/getting-started/providers/google', 'Auth.js — Google provider', 'authjs.dev',
      'How Day Board signs users in with Google and gets a refresh token for Calendar + Gmail access.',
      '["access_type: offline + prompt: consent in the authorization params are required to get a refresh_token back", "JWT sessions store the access/refresh token in a signed cookie — no database needed for sign-in itself", "A jwt() callback is the place to refresh an expiring access token before it''s handed to the app", "Restricted scopes (calendar.readonly, gmail.readonly) keep the OAuth consent screen in Testing mode until Google verifies the app"]',
      'Day Board''s auth.ts configures NextAuth v5 with the Google provider, requesting calendar.readonly and gmail.readonly on top of the default profile scopes. Its jwt() callback refreshes the access token when it''s about to expire, and session() exposes the current access token to server components so lib/google.ts can call the Calendar and Gmail REST APIs directly.'
    ),
    (
      :user_id, 'article', 'https://developers.google.com/calendar/api/guides/overview', 'Google Calendar API', 'developers.google.com',
      'The events.list endpoint Day Board calls for today''s agenda and the month view.',
      '["events.list on calendar \"primary\" with timeMin/timeMax covers both a single day and a month range", "singleEvents: true expands recurring events into individual instances — needed for an agenda view", "An all-day event has start.date instead of start.dateTime — the two need different formatting", "Creating events needs the broader \"calendar\" write scope; Day Board deliberately avoids that and links out to Google Calendar''s own create-event page instead"]',
      'lib/google.ts in Day Board wraps a single getEvents(accessToken, timeMin, timeMax) helper, called once for today (the agenda timeline) and once for the current month (the mini calendar''s event dots). Keeping it to the read-only calendar.readonly scope was a deliberate smaller option — see day-board/README.md.'
    ),
    (
      :user_id, 'article', 'https://developers.google.com/gmail/api/guides', 'Gmail API', 'developers.google.com',
      'How Day Board reads the inbox: list messages, then fetch headers for each one.',
      '["messages.list returns only ids — you need a second call per message to get subject/from/snippet", "format: metadata with metadataHeaders keeps each follow-up call small instead of fetching the full body", "q: \"in:inbox\" reuses normal Gmail search syntax to scope the query", "internalDate on a message is a millisecond timestamp string, not ISO — needs new Date(Number(...))"]',
      'Day Board''s getRecentEmails() lists the newest inbox message ids, then fetches From/Subject headers and the snippet for each in parallel. It only ever reads mail (gmail.readonly) — there''s no send/reply feature in the MVP.'
    ),
    (
      :user_id, 'article', 'https://vercel.com/docs/cron-jobs', 'Vercel Cron Jobs', 'vercel.com',
      'Scheduling the monthly report, the morning brief, and (eventually) the nightly review as background jobs.',
      '["vercel.json''s crons array maps a path to a standard cron expression", "A cron-triggered route should check a shared secret header, since the endpoint is otherwise a public URL", "Cron jobs only run once deployed to Vercel — there''s no local equivalent, so they''re tested by curling the route with the secret", "A job that needs to act without a live user session (like a scheduled brief) needs its own way to get credentials — Day Board''s gap here is documented in its README"]',
      'Receipt Accountant''s vercel.json schedules /api/cron/monthly-report on the 1st of each month using the Supabase service-role key (no user session needed, since it iterates all users server-side). Day Board''s /api/cron/morning-brief is wired the same way but is currently a documented stub, because NextAuth''s JWT sessions don''t give a cron job anywhere to read a user''s refresh token from.'
    ),
    (
      :user_id, 'article', 'https://supabase.com/docs/guides/ai/vector-embeddings', 'Supabase AI & Vector Embeddings', 'supabase.com',
      'pgvector basics: storing embeddings in Postgres and querying them with cosine distance.',
      '["pgvector adds a vector(n) column type and <=> (cosine distance) / <#> (inner product) operators", "An ivfflat index speeds up nearest-neighbor search once a table has more than a few thousand rows", "A SQL function (e.g. match_chunks) wrapping the ORDER BY ... <=> ... LIMIT query is the cleanest way to call it from the app via supabase.rpc()", "Embedding dimension must match exactly between the column definition and whatever model produced the vectors"]',
      'Personal Library''s chunks table stores a vector(1024) column (matching Voyage AI''s voyage-3 model) and a match_chunks() SQL function does the nearest-neighbor search, called from app/api/ask/route.ts via supabase.rpc(). Second Brain AI is planned to reuse the same pattern for its own notes/PDF search.'
    ),
    (
      :user_id, 'article', 'https://docs.voyageai.com/docs/embeddings', 'Voyage AI Embeddings', 'docs.voyageai.com',
      'The embedding model Personal Library uses to turn saved text into searchable vectors.',
      '["input_type: \"document\" vs \"query\" slightly changes how the model embeds text — use the right one on each side", "voyage-3 returns 1024-dimensional vectors — must match the Postgres column size", "Embedding is a separate API call from Claude — Anthropic recommends Voyage as its embeddings partner rather than shipping its own", "Batch multiple chunks in one request (the input array) instead of one call per chunk to cut latency and cost"]',
      'lib/embeddings.ts in Personal Library calls Voyage once per saved item (one request, one array of chunks) to embed with input_type "document", and once per question with input_type "query". Second Brain AI''s plan reuses the same helper for its own note/PDF chunks.'
    ),
    (
      :user_id, 'article', 'https://tiptap.dev/docs/editor/getting-started/overview', 'Tiptap editor', 'tiptap.dev',
      'The rich-text editor Second Brain AI will use for notes — headings, lists, checklists, and JSON content storage.',
      '["Tiptap stores content as a JSON document (ProseMirror schema), not raw HTML — store that JSON, render it back through the editor", "StarterKit bundles the common extensions (bold, lists, headings) so you don''t configure each one by hand", "Extensions are composable — add TaskList/TaskItem for checklists, Image for inline images, Link for auto-linking", "Debounce onUpdate before saving to avoid writing to the database on every keystroke"]',
      'Second Brain AI''s PLAN.md calls for a Tiptap-based notes editor storing content_json per note, with files/PDFs attached separately and their extracted text indexed the same way Personal Library indexes articles — chunk, embed, store in a chunks table, query with match_chunks().'
    ),
    (
      :user_id, 'article', 'https://recharts.org/en-US/api', 'Recharts', 'recharts.org',
      'The charting library behind Receipt Accountant''s spending donut (and a natural fit for Daily Review Assistant''s habit stats later).',
      '["ResponsiveContainer makes a chart fill its parent instead of needing fixed pixel dimensions", "PieChart + Pie with innerRadius > 0 gives a donut chart; outerRadius controls its thickness", "Cell components let each pie slice (or bar) have its own color, driven by data instead of a fixed palette", "Tooltip''s formatter prop controls exactly how hover values are displayed (e.g. currency formatting)"]',
      'components/CategoryDonut.tsx in Receipt Accountant is a small Recharts PieChart with a center label overlay showing the month''s total. Daily Review Assistant''s planned habit-streak charts and Day Board''s "later" stats would reasonably use the same library rather than add a different charting dependency.'
    )
  returning id
)
insert into collection_items (collection_id, item_id)
select (select id from new_collection), id from new_items;
