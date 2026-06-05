import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPosts } from "@/lib/posts";
import HeroCarousel from "@/components/hero-carousel";
import PostCard from "@/components/post-card";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: categories }, posts] = await Promise.all([
    supabase.from("xrc_categories").select("*").order("id"),
    getPosts(supabase, { limit: 12 }),
  ]);

  const cats = (categories as Category[]) || [];
  const ranking = [...posts].sort((a, b) => b.like_count - a.like_count).slice(0, 5);

  return (
    <main>
      <HeroCarousel />

      <section className="container categories">
        {cats.map((c) => (
          <Link key={c.id} href={`/board?cat=${c.slug}`} className="cat-tile">
            <span className="cat-ico" style={{ ["--c" as any]: c.color || "#3b5bff" }}>{c.icon || "📌"}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </section>

      <div className="container body-grid">
        <section className="feed">
          <div className="feed-head">
            <h3>커뮤니티 피드</h3>
            <Link href="/board" className="btn btn-outline">전체보기</Link>
          </div>

          {posts.length ? (
            <ul className="post-list">
              {posts.map((p) => <PostCard key={p.id} p={p} />)}
            </ul>
          ) : (
            <div className="empty">
              아직 글이 없어요. <Link href="/write" style={{ color: "var(--blue)", fontWeight: 700 }}>첫 글을 작성</Link>해보세요!
            </div>
          )}
        </section>

        <aside className="sidebar">
          <div className="card user-card">
            <div className="uc-avatar">👋</div>
            <p className="uc-title">커뮤니티에 오신 걸 환영해요</p>
            <p className="uc-sub">로그인하고 글쓰기에 참여하세요.</p>
            <Link href="/login" className="btn btn-primary btn-block">로그인 / 회원가입</Link>
          </div>

          <div className="card">
            <h4 className="card-title">🔥 인기글 랭킹</h4>
            {ranking.length ? (
              <ol className="rank-list">
                {ranking.map((p) => (
                  <li key={p.id}>
                    <div>
                      <Link href={`/post/${p.id}`} className="rk-title">{p.title}</Link>
                      <div className="rk-sub">{p.xrc_categories?.name} · 댓글 {p.comment_count}</div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="uc-sub" style={{ margin: 0 }}>아직 데이터가 없어요.</p>}
          </div>

          <div className="card">
            <h4 className="card-title">🏷️ 카테고리</h4>
            <div className="tag-cloud">
              {cats.map((c) => <Link key={c.id} href={`/board?cat=${c.slug}`} className="tag">#{c.name}</Link>)}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
