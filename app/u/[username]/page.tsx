import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostsByAuthor } from "@/lib/posts";
import PostCard from "@/components/post-card";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("xrc_profiles")
    .select("id, username, avatar_url, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: stats }, posts] = await Promise.all([
    supabase.rpc("xrc_profile_stats", { p_user_id: profile.id }).maybeSingle(),
    getPostsByAuthor(supabase, profile.id),
  ]);

  const s = (stats as any) || { post_count: 0, comment_count: 0, like_received: 0 };
  const joined = new Date(profile.created_at).toLocaleDateString("ko-KR");

  return (
    <main className="page">
      <div className="page-layout">
        <section>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <span className="avatar" style={{ width: 64, height: 64, fontSize: 28 }}>{profile.username[0]}</span>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>{profile.username}</h1>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>가입일 {joined}</p>
            </div>
          </div>

          <div className="categories" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0, marginBottom: 22 }}>
            <div className="cat-tile"><b style={{ fontSize: 22 }}>{s.post_count}</b><span>작성글</span></div>
            <div className="cat-tile"><b style={{ fontSize: 22 }}>{s.comment_count}</b><span>댓글</span></div>
            <div className="cat-tile"><b style={{ fontSize: 22 }}>{s.like_received}</b><span>받은 좋아요</span></div>
          </div>

          <div className="feed-head"><h3>📝 {profile.username}님의 글</h3></div>
          {posts.length ? (
            <ul className="post-list">{posts.map((p) => <PostCard key={p.id} p={p} />)}</ul>
          ) : (
            <div className="empty">아직 작성한 글이 없어요.</div>
          )}
        </section>

        <aside className="sidebar">
          <div className="card">
            <h4 className="card-title">ℹ️ 정보</h4>
            <ul className="stat-list">
              <li><span>닉네임</span><b>{profile.username}</b></li>
              <li><span>가입일</span><b>{joined}</b></li>
            </ul>
          </div>
          <Link href="/board" className="btn btn-outline btn-block">전체 글 보기</Link>
        </aside>
      </div>
    </main>
  );
}
