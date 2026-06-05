import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPosts, timeAgo } from "@/lib/posts";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const supabase = createClient();
  const slug = searchParams.cat;

  const [{ data: categories }, posts] = await Promise.all([
    supabase.from("xrc_categories").select("*").order("id"),
    getPosts(supabase, { categorySlug: slug, limit: 50 }),
  ]);

  const cats = (categories as Category[]) || [];
  const current = cats.find((c) => c.slug === slug);

  return (
    <main className="page">
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span>
        <Link href="/board">포럼</Link>
        {current && <><span className="sep">›</span><span>{current.name}</span></>}
      </nav>

      <div className="page-layout">
        <section>
          <div className="board-head">
            <div>
              <h1>{current ? `${current.icon || ""} ${current.name}` : "📋 전체 글"}</h1>
              <p className="board-desc">XR 사용자들이 나누는 이야기 공간이에요.</p>
            </div>
            <Link href="/write" className="btn btn-primary">✏️ 글쓰기</Link>
          </div>

          <div className="board-toolbar">
            <div className="chip-row">
              <Link href="/board" className={`chip ${!slug ? "is-active" : ""}`}>전체</Link>
              {cats.map((c) => (
                <Link key={c.id} href={`/board?cat=${c.slug}`} className={`chip ${slug === c.slug ? "is-active" : ""}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {posts.length ? (
            <ul className="thread-list">
              {posts.map((p, idx) => (
                <li className="thread" key={p.id}>
                  <div className="th-no">{posts.length - idx}</div>
                  <div className="th-main">
                    <span className="th-cat">{p.xrc_categories?.name}</span>
                    <Link href={`/post/${p.id}`} className="th-title">{p.title}</Link>
                    {p.comment_count > 0 && <span className="th-cmt">[{p.comment_count}]</span>}
                  </div>
                  <div className="th-author"><span className="avatar">{(p.xrc_profiles?.username || "익")[0]}</span>{p.xrc_profiles?.username || "익명"}</div>
                  <div className="th-stats">♥ <b>{p.like_count}</b> · 조회 {p.views}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              이 게시판에 아직 글이 없어요. <Link href="/write" style={{ color: "var(--blue)", fontWeight: 700 }}>첫 글 작성하기</Link>
            </div>
          )}

          <div className="board-bottom">
            <Link href="/write" className="btn btn-primary">✏️ 글쓰기</Link>
          </div>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h4 className="card-title">🏷️ 카테고리</h4>
            <div className="tag-cloud">
              <Link href="/board" className="tag">#전체</Link>
              {cats.map((c) => <Link key={c.id} href={`/board?cat=${c.slug}`} className="tag">#{c.name}</Link>)}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
