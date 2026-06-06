-- ============================================================
-- XR 커뮤니티 0005 — 보안 수정 (권한 상승 방지)
-- 문제: 프로필 self-update 정책이 컬럼을 제한하지 않아
--       일반 사용자가 본인 is_admin=true 로 바꿔 관리자 승격 가능.
-- 해결: xrc_profiles 의 테이블 UPDATE 권한을 회수하고
--       username/avatar_url 컬럼만 갱신 가능하도록 제한.
-- (관리자 지정은 대시보드/service_role 로만 → 영향 없음)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

revoke update on public.xrc_profiles from authenticated;
revoke update on public.xrc_profiles from anon;

grant update (username, avatar_url) on public.xrc_profiles to authenticated;
