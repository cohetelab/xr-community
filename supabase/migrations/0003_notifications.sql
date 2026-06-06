-- ============================================================
-- XR 커뮤니티 0003 — 알림 (댓글 / 답글 / 좋아요)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

create table if not exists public.xrc_notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade, -- 받는 사람
  actor_id   uuid references auth.users(id) on delete cascade,          -- 행동한 사람
  type       text not null,                                             -- comment | reply | like
  post_id    bigint references public.xrc_posts(id) on delete cascade,
  comment_id bigint references public.xrc_comments(id) on delete cascade,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists xrc_notif_user_idx on public.xrc_notifications(user_id, is_read, created_at desc);

alter table public.xrc_notifications enable row level security;

drop policy if exists xrc_notif_read on public.xrc_notifications;
create policy xrc_notif_read on public.xrc_notifications for select using (auth.uid() = user_id);
drop policy if exists xrc_notif_update on public.xrc_notifications;
create policy xrc_notif_update on public.xrc_notifications for update using (auth.uid() = user_id);
drop policy if exists xrc_notif_delete on public.xrc_notifications;
create policy xrc_notif_delete on public.xrc_notifications for delete using (auth.uid() = user_id);
-- insert는 트리거(security definer)로만 수행 → 사용자 insert 정책 불필요

-- ============================================================
-- 댓글/답글 알림 트리거
-- ============================================================
create or replace function public.xrc_notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  post_author uuid;
  parent_author uuid;
begin
  select author_id into post_author from public.xrc_posts where id = NEW.post_id;

  -- 답글이면 부모 댓글 작성자에게 'reply'
  if NEW.parent_id is not null then
    select author_id into parent_author from public.xrc_comments where id = NEW.parent_id;
    if parent_author is not null and parent_author <> NEW.author_id then
      insert into public.xrc_notifications (user_id, actor_id, type, post_id, comment_id)
      values (parent_author, NEW.author_id, 'reply', NEW.post_id, NEW.id);
    end if;
  end if;

  -- 글 작성자에게 'comment' (단, 본인 글이거나 위 부모와 동일인이면 제외)
  if post_author is not null
     and post_author <> NEW.author_id
     and post_author is distinct from parent_author then
    insert into public.xrc_notifications (user_id, actor_id, type, post_id, comment_id)
    values (post_author, NEW.author_id, 'comment', NEW.post_id, NEW.id);
  end if;

  return NEW;
end;
$$;

drop trigger if exists xrc_trg_notify_comment on public.xrc_comments;
create trigger xrc_trg_notify_comment
  after insert on public.xrc_comments
  for each row execute function public.xrc_notify_on_comment();

-- ============================================================
-- 좋아요 알림 트리거
-- ============================================================
create or replace function public.xrc_notify_on_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.xrc_posts where id = NEW.post_id;
  if post_author is not null and post_author <> NEW.user_id then
    insert into public.xrc_notifications (user_id, actor_id, type, post_id)
    values (post_author, NEW.user_id, 'like', NEW.post_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists xrc_trg_notify_like on public.xrc_post_likes;
create trigger xrc_trg_notify_like
  after insert on public.xrc_post_likes
  for each row execute function public.xrc_notify_on_like();

-- ============================================================
-- 모두 읽음 처리 RPC
-- ============================================================
create or replace function public.xrc_mark_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.xrc_notifications set is_read = true
  where user_id = auth.uid() and is_read = false;
$$;
