import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookmarkedPosts } from "@/lib/posts";
import PostCard from "@/components/post-card";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/bookmarks");

  const posts = await getBookmarkedPosts(supabase, user.id);

  return (
    <main className="page" style={{ maxWidth: 820 }}>
      <div className="feed-head" style={{ marginBottom: 16 }}>
        <h3>🔖 저장한 글</h3>
        <Link href="/board" className="btn btn-outline">전체 글</Link>
      </div>

      {posts.length ? (
        <ul className="post-list">{posts.map((p) => <PostCard key={p.id} p={p} />)}</ul>
      ) : (
        <div className="empty">
          저장한 글이 없어요. 글 상세에서 <b>🔖 저장</b>을 눌러 모아보세요.
        </div>
      )}
    </main>
  );
}
