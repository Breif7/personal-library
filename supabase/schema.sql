-- Personal Library schema. Run in the Supabase SQL editor.
create extension if not exists vector;

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('article', 'video', 'book', 'note')),
  url text,
  title text not null,
  source text,
  author text,
  thumbnail text,
  summary text,
  key_ideas jsonb not null default '[]',
  body text, -- manual notes / book notes
  favorite boolean not null default false,
  saved_at timestamptz not null default now()
);

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  content text not null,
  embedding vector(1024) -- voyage-3 dimension
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#c2410c',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists collection_items (
  collection_id uuid not null references collections(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  primary key (collection_id, item_id)
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer_md text not null,
  cited_item_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists items_user_type_idx on items (user_id, type);
create index if not exists chunks_embedding_idx on chunks using ivfflat (embedding vector_cosine_ops);

alter table items enable row level security;
alter table chunks enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table questions enable row level security;

create policy "own rows" on items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chunks via item" on chunks for all
  using (exists (select 1 from items where items.id = chunks.item_id and items.user_id = auth.uid()))
  with check (exists (select 1 from items where items.id = chunks.item_id and items.user_id = auth.uid()));
create policy "collection_items via collection" on collection_items for all
  using (exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = auth.uid()))
  with check (exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = auth.uid()));

-- Semantic search: nearest chunks for a given user, newest matches first by similarity.
create or replace function match_chunks(
  query_embedding vector(1024),
  match_user_id uuid,
  match_count int default 8
)
returns table (chunk_id uuid, item_id uuid, content text, similarity float)
language sql stable
as $$
  select c.id, c.item_id, c.content, 1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  join items i on i.id = c.item_id
  where i.user_id = match_user_id
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
