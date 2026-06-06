-- ============================================================
-- XR 커뮤니티 0007 — 북마크/스크랩
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

create table if not exists public.xrc_bookmarks (
  user_id    uuid   not null references auth.users(id) on delete cascade,
  post_id    bigint not null references public.xrc_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists xrc_bookmarks_user_idx on public.xrc_bookmarks(user_id, created_at desc);

alter table public.xrc_bookmarks enable row level security;

drop policy if exists xrc_bm_read on public.xrc_bookmarks;
create policy xrc_bm_read on public.xrc_bookmarks for select using (auth.uid() = user_id);
drop policy if exists xrc_bm_insert on public.xrc_bookmarks;
create policy xrc_bm_insert on public.xrc_bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists xrc_bm_delete on public.xrc_bookmarks;
create policy xrc_bm_delete on public.xrc_bookmarks for delete using (auth.uid() = user_id);
