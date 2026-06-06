-- ============================================================
-- XR 커뮤니티 0002 — 이미지 업로드 / 검색·정렬·페이지네이션 / 프로필
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

-- ---------- 게시글 이미지 컬럼 ----------
alter table public.xrc_posts add column if not exists image_urls text[];

-- ============================================================
-- Storage 버킷 + 정책 (이미지 업로드)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('xrc-media', 'xrc-media', true)
on conflict (id) do nothing;

-- 누구나 읽기(public 버킷)
drop policy if exists "xrc_media_read" on storage.objects;
create policy "xrc_media_read" on storage.objects
  for select using (bucket_id = 'xrc-media');

-- 로그인 사용자만 업로드 (본인 폴더: <uid>/...)
drop policy if exists "xrc_media_insert" on storage.objects;
create policy "xrc_media_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'xrc-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 업로드물만 삭제
drop policy if exists "xrc_media_delete" on storage.objects;
create policy "xrc_media_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'xrc-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 목록 RPC (검색 + 정렬 + 페이지네이션 + 카운트 포함)
-- p_sort: 'latest' | 'popular' | 'comments' | 'views'
-- ============================================================
create or replace function public.xrc_list_posts(
  p_category text default null,
  p_search   text default null,
  p_sort     text default 'latest',
  p_limit    int  default 20,
  p_offset   int  default 0
)
returns table (
  id bigint, title text, content text, category_id bigint, author_id uuid,
  tag text, tags text[], image_urls text[], views integer, created_at timestamptz,
  cat_name text, cat_slug text, cat_icon text, cat_color text,
  author_name text, author_avatar text,
  like_count bigint, comment_count bigint
)
language sql stable security definer set search_path = public as $$
  select
    p.id, p.title, p.content, p.category_id, p.author_id, p.tag, p.tags, p.image_urls, p.views, p.created_at,
    c.name, c.slug, c.icon, c.color,
    pr.username, pr.avatar_url,
    (select count(*) from xrc_post_likes l where l.post_id = p.id) as like_count,
    (select count(*) from xrc_comments  cm where cm.post_id = p.id) as comment_count
  from xrc_posts p
  left join xrc_categories c on c.id = p.category_id
  left join xrc_profiles  pr on pr.id = p.author_id
  where (p_category is null or c.slug = p_category)
    and (
      p_search is null or p_search = '' or
      p.title ilike '%' || p_search || '%' or
      p.content ilike '%' || p_search || '%'
    )
  order by
    case when p_sort = 'views'    then p.views end desc nulls last,
    case when p_sort = 'popular'  then (select count(*) from xrc_post_likes l where l.post_id = p.id) end desc nulls last,
    case when p_sort = 'comments' then (select count(*) from xrc_comments cm where cm.post_id = p.id) end desc nulls last,
    p.created_at desc
  limit greatest(p_limit, 1) offset greatest(p_offset, 0);
$$;

-- 총 개수(페이지네이션용)
create or replace function public.xrc_count_posts(
  p_category text default null,
  p_search   text default null
)
returns bigint
language sql stable security definer set search_path = public as $$
  select count(*)
  from xrc_posts p
  left join xrc_categories c on c.id = p.category_id
  where (p_category is null or c.slug = p_category)
    and (
      p_search is null or p_search = '' or
      p.title ilike '%' || p_search || '%' or
      p.content ilike '%' || p_search || '%'
    );
$$;

-- ============================================================
-- 프로필 활동 카운트 (프로필 페이지용)
-- ============================================================
create or replace function public.xrc_profile_stats(p_user_id uuid)
returns table (post_count bigint, comment_count bigint, like_received bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from xrc_posts where author_id = p_user_id),
    (select count(*) from xrc_comments where author_id = p_user_id),
    (select count(*) from xrc_post_likes l join xrc_posts p on p.id = l.post_id where p.author_id = p_user_id);
$$;
