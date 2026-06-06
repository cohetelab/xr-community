-- ============================================================
-- XR 커뮤니티 0006 — 실시간 댓글 (Supabase Realtime)
-- 댓글 테이블 변경을 실시간으로 구독할 수 있게 발행(publication)에 등록.
-- DELETE 이벤트에서 post_id 필터가 동작하도록 REPLICA IDENTITY FULL 설정.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

alter table public.xrc_comments replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'xrc_comments'
  ) then
    alter publication supabase_realtime add table public.xrc_comments;
  end if;
end $$;
