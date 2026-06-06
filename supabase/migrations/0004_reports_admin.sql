-- ============================================================
-- XR 커뮤니티 0004 — 신고 / 관리자 / 숨김
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 실행 후 본인 계정을 관리자로 지정:
--   update public.xrc_profiles set is_admin = true where username = '내닉네임';
-- ============================================================

-- ---------- 권한/숨김 컬럼 ----------
alter table public.xrc_profiles add column if not exists is_admin  boolean not null default false;
alter table public.xrc_posts    add column if not exists is_hidden boolean not null default false;
alter table public.xrc_comments add column if not exists is_hidden boolean not null default false;

-- ---------- 관리자 판별 함수 ----------
create or replace function public.xrc_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.xrc_profiles where id = auth.uid()), false);
$$;

-- ---------- 신고 테이블 ----------
create table if not exists public.xrc_reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,            -- 'post' | 'comment'
  post_id     bigint references public.xrc_posts(id) on delete cascade,
  comment_id  bigint references public.xrc_comments(id) on delete cascade,
  reason      text not null,
  status      text not null default 'pending',  -- pending | resolved
  created_at  timestamptz not null default now()
);
create index if not exists xrc_reports_status_idx on public.xrc_reports(status, created_at desc);

alter table public.xrc_reports enable row level security;
drop policy if exists xrc_report_insert on public.xrc_reports;
create policy xrc_report_insert on public.xrc_reports for insert to authenticated
  with check (auth.uid() = reporter_id);
drop policy if exists xrc_report_admin_read on public.xrc_reports;
create policy xrc_report_admin_read on public.xrc_reports for select using (public.xrc_is_admin());
drop policy if exists xrc_report_admin_update on public.xrc_reports;
create policy xrc_report_admin_update on public.xrc_reports for update using (public.xrc_is_admin());

-- ---------- 관리자: 모든 글/댓글 수정·삭제 가능 ----------
drop policy if exists xrc_post_admin_update on public.xrc_posts;
create policy xrc_post_admin_update on public.xrc_posts for update using (public.xrc_is_admin());
drop policy if exists xrc_post_admin_delete on public.xrc_posts;
create policy xrc_post_admin_delete on public.xrc_posts for delete using (public.xrc_is_admin());
drop policy if exists xrc_cmt_admin_update on public.xrc_comments;
create policy xrc_cmt_admin_update on public.xrc_comments for update using (public.xrc_is_admin());
drop policy if exists xrc_cmt_admin_delete on public.xrc_comments;
create policy xrc_cmt_admin_delete on public.xrc_comments for delete using (public.xrc_is_admin());

-- ============================================================
-- 목록/카운트 RPC 갱신 — 숨김 글 제외
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
    (select count(*) from xrc_post_likes l where l.post_id = p.id),
    (select count(*) from xrc_comments  cm where cm.post_id = p.id and coalesce(cm.is_hidden,false) = false)
  from xrc_posts p
  left join xrc_categories c on c.id = p.category_id
  left join xrc_profiles  pr on pr.id = p.author_id
  where coalesce(p.is_hidden, false) = false
    and (p_category is null or c.slug = p_category)
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

create or replace function public.xrc_count_posts(
  p_category text default null,
  p_search   text default null
)
returns bigint
language sql stable security definer set search_path = public as $$
  select count(*)
  from xrc_posts p
  left join xrc_categories c on c.id = p.category_id
  where coalesce(p.is_hidden, false) = false
    and (p_category is null or c.slug = p_category)
    and (
      p_search is null or p_search = '' or
      p.title ilike '%' || p_search || '%' or
      p.content ilike '%' || p_search || '%'
    );
$$;
