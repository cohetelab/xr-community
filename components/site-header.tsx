import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUnreadCount } from "@/lib/notifications";
import BrandMark from "./brand-mark";
import SignOutButton from "./sign-out-button";

export default async function SiteHeader() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let username = "";
  let avatar: string | null = null;
  let unread = 0;
  let admin = false;
  if (user) {
    const [{ data: profile }, count] = await Promise.all([
      supabase.from("xrc_profiles").select("username, is_admin, avatar_url").eq("id", user.id).maybeSingle(),
      getUnreadCount(supabase, user.id),
    ]);
    username = profile?.username || user.email?.split("@")[0] || "회원";
    admin = !!(profile as any)?.is_admin;
    avatar = (profile as any)?.avatar_url || null;
    unread = count;
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="XR 커뮤니티 홈">
          <span style={{ color: "var(--blue)", display: "flex" }}><BrandMark /></span>
          <span className="brand-name">XR <b>커뮤니티</b></span>
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          <Link href="/" className="nav-link">홈</Link>
          <Link href="/board" className="nav-link">포럼</Link>
          <Link href="/board?cat=qna" className="nav-link">Q&amp;A</Link>
          <Link href="/board?cat=tip" className="nav-link">가이드</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link href="/bookmarks" className="bell" aria-label="저장한 글" title="저장한 글">🔖</Link>
              <Link href="/notifications" className="bell" aria-label="알림">
                🔔{unread > 0 && <span className="bell-badge">{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <Link href={`/u/${encodeURIComponent(username)}`} className="user-chip">
                {avatar
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={avatar} alt="" className="avatar" style={{ objectFit: "cover" }} />
                  : <span className="avatar">{username[0]}</span>}
                {username}
              </Link>
              <Link href="/settings" className="bell" title="설정">⚙️</Link>
              {admin && <Link href="/admin" className="btn btn-ghost" title="관리자">🛡️</Link>}
              <Link href="/write" className="btn btn-primary">✏️ 글쓰기</Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">로그인</Link>
              <Link href="/login?tab=signup" className="btn btn-primary">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
