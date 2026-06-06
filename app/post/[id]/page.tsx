import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPost, getComments } from "@/lib/posts";
import LikeButton from "@/components/like-button";
import CommentSection from "@/components/comment-section";
import PostActions from "@/components/post-actions";
import ReportButton from "@/components/report-button";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const supabase = createClient();
  const post = await getPost(supabase, id);
  if (!post) notFound();

  // 조회수 증가 (best-effort)
  await supabase.rpc("xrc_increment_views", { p_post_id: id });

  const { data: { user } } = await supabase.auth.getUser();

  const [comments, likedRes, profileRes] = await Promise.all([
    getComments(supabase, id),
    user
      ? supabase.from("xrc_post_likes").select("post_id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("xrc_profiles").select("username").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const currentUser = user
    ? { id: user.id, username: (profileRes.data as any)?.username || user.email?.split("@")[0] || "회원" }
    : null;

  const created = new Date(post.created_at).toLocaleString("ko-KR");
  const author = post.xrc_profiles?.username || "익명";

  return (
    <main className="page">
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span>
        <Link href="/board">포럼</Link><span className="sep">›</span>
        <Link href={`/board?cat=${post.xrc_categories?.slug || ""}`}>{post.xrc_categories?.name || "일반"}</Link>
      </nav>

      <div className="page-layout">
        <section>
          <article className="article">
            <div className="article-head">
              <span className="article-cat">{post.xrc_categories?.name}{post.tag ? ` · ${post.tag}` : ""}</span>
              <h1 className="article-title">{post.title}</h1>
              <div className="article-byline">
                <span className="avatar">{author[0]}</span>
                <div>
                  <div className="byline-name">
                    <Link href={`/u/${encodeURIComponent(author)}`}>{author}</Link>
                  </div>
                  <div className="byline-meta">
                    <span>{created}</span>
                    <span>조회 {post.views}</span>
                    <span>댓글 {comments?.length ?? 0}</span>
                  </div>
                </div>
                {user?.id === post.author_id && <PostActions postId={post.id} />}
              </div>
            </div>

            <div className="article-body">{post.content}</div>

            {post.image_urls && post.image_urls.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
                {post.image_urls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
                ))}
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="article-tags">
                {post.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
              </div>
            )}

            <div className="reaction-bar">
              <LikeButton
                postId={post.id}
                initialCount={post.like_count}
                initiallyLiked={!!likedRes.data}
                isLoggedIn={!!user}
              />
              {user?.id !== post.author_id && (
                <ReportButton targetType="post" postId={post.id} isLoggedIn={!!user} />
              )}
            </div>
          </article>

          <CommentSection
            postId={post.id}
            postAuthorId={post.author_id}
            initialComments={(comments as any) || []}
            currentUser={currentUser}
          />

          <div className="board-bottom" style={{ marginTop: 18 }}>
            <Link href="/board" className="btn btn-outline">목록으로</Link>
          </div>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h4 className="card-title">✍️ 작성자</h4>
            <div className="post-author"><span className="avatar">{author[0]}</span><b>{author}</b></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
