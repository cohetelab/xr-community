-- ============================================================
-- XR 커뮤니티 초기 스키마
-- Supabase 프로젝트: myurtqvesgfrawryczuh
-- 기존 테이블과의 충돌 방지를 위해 모든 테이블에 xrc_ 접두사를 사용한다.
-- (이 프로젝트를 다른 서비스와 공유한다면 auth.users(로그인 계정)는 공유됨)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

-- ---------- 카테고리 ----------
create table if not exists public.xrc_categories (
  id    bigint generated always as identity primary key,
  name  text not null,
  slug  text not null unique,
  icon  text,
  color text
);

-- ---------- 프로필 (auth.users 1:1) ----------
create table if not exists public.xrc_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- 게시글 ----------
create table if not exists public.xrc_posts (
  id          bigint generated always as identity primary key,
  title       text not null,
  content     text not null,
  category_id bigint not null references public.xrc_categories(id),
  author_id   uuid not null references auth.users(id) on delete cascade,
  tag         text,
  tags        text[],
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists xrc_posts_category_idx on public.xrc_posts(category_id);
create index if not exists xrc_posts_created_idx  on public.xrc_posts(created_at desc);

-- ---------- 댓글 (대댓글 지원) ----------
create table if not exists public.xrc_comments (
  id         bigint generated always as identity primary key,
  post_id    bigint not null references public.xrc_posts(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  parent_id  bigint references public.xrc_comments(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists xrc_comments_post_idx on public.xrc_comments(post_id);

-- ---------- 게시글 좋아요 ----------
create table if not exists public.xrc_post_likes (
  post_id    bigint not null references public.xrc_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ============================================================
-- 조회수 증가 RPC
-- ============================================================
create or replace function public.xrc_increment_views(p_post_id bigint)
returns void language sql security definer set search_path = public as $$
  update public.xrc_posts set views = views + 1 where id = p_post_id;
$$;

-- ============================================================
-- 가입 시 프로필 자동 생성 트리거
-- ============================================================
create or replace function public.xrc_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.xrc_profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists xrc_on_auth_user_created on auth.users;
create trigger xrc_on_auth_user_created
  after insert on auth.users
  for each row execute function public.xrc_handle_new_user();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.xrc_categories enable row level security;
alter table public.xrc_profiles   enable row level security;
alter table public.xrc_posts      enable row level security;
alter table public.xrc_comments   enable row level security;
alter table public.xrc_post_likes enable row level security;

-- 카테고리: 누구나 읽기
drop policy if exists xrc_cat_read on public.xrc_categories;
create policy xrc_cat_read on public.xrc_categories for select using (true);

-- 프로필: 누구나 읽기 / 본인만 수정·생성
drop policy if exists xrc_prof_read on public.xrc_profiles;
create policy xrc_prof_read on public.xrc_profiles for select using (true);
drop policy if exists xrc_prof_insert on public.xrc_profiles;
create policy xrc_prof_insert on public.xrc_profiles for insert with check (auth.uid() = id);
drop policy if exists xrc_prof_update on public.xrc_profiles;
create policy xrc_prof_update on public.xrc_profiles for update using (auth.uid() = id);

-- 게시글: 누구나 읽기 / 로그인 사용자가 본인 글 작성·수정·삭제
drop policy if exists xrc_post_read on public.xrc_posts;
create policy xrc_post_read on public.xrc_posts for select using (true);
drop policy if exists xrc_post_insert on public.xrc_posts;
create policy xrc_post_insert on public.xrc_posts for insert with check (auth.uid() = author_id);
drop policy if exists xrc_post_update on public.xrc_posts;
create policy xrc_post_update on public.xrc_posts for update using (auth.uid() = author_id);
drop policy if exists xrc_post_delete on public.xrc_posts;
create policy xrc_post_delete on public.xrc_posts for delete using (auth.uid() = author_id);

-- 댓글: 누구나 읽기 / 본인 댓글 작성·삭제
drop policy if exists xrc_cmt_read on public.xrc_comments;
create policy xrc_cmt_read on public.xrc_comments for select using (true);
drop policy if exists xrc_cmt_insert on public.xrc_comments;
create policy xrc_cmt_insert on public.xrc_comments for insert with check (auth.uid() = author_id);
drop policy if exists xrc_cmt_delete on public.xrc_comments;
create policy xrc_cmt_delete on public.xrc_comments for delete using (auth.uid() = author_id);

-- 좋아요: 누구나 읽기 / 본인 것만 추가·삭제
drop policy if exists xrc_like_read on public.xrc_post_likes;
create policy xrc_like_read on public.xrc_post_likes for select using (true);
drop policy if exists xrc_like_insert on public.xrc_post_likes;
create policy xrc_like_insert on public.xrc_post_likes for insert with check (auth.uid() = user_id);
drop policy if exists xrc_like_delete on public.xrc_post_likes;
create policy xrc_like_delete on public.xrc_post_likes for delete using (auth.uid() = user_id);

-- ============================================================
-- 카테고리 시드
-- ============================================================
insert into public.xrc_categories (name, slug, icon, color) values
  ('게임',        'game',  '🎮', '#3b5bff'),
  ('앱',          'app',   '📱', '#0ea5e9'),
  ('팁 & 노하우', 'tip',   '💡', '#22c55e'),
  ('Q&A',         'qna',   '❓', '#f59e0b'),
  ('영상',        'video', '🎬', '#a855f7'),
  ('개발',        'dev',   '🛠️', '#ef4444')
on conflict (slug) do nothing;
