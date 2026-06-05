import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BrandMark from "./brand-mark";
import SignOutButton from "./sign-out-button";

export default async function SiteHeader() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let username = "";
  if (user) {
    const { data: profile } = await supabase
      .from("xrc_profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = profile?.username || user.email?.split("@")[0] || "회원";
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
              <span className="user-chip"><span className="avatar">{username[0]}</span>{username}</span>
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
