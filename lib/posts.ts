import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT =
  "*, xrc_categories(*), xrc_profiles(id,username,avatar_url), xrc_comments(count), xrc_post_likes(count)";

export type PostRow = {
  id: number;
  title: string;
  content: string;
  category_id: number;
  author_id: string;
  tag: string | null;
  tags: string[] | null;
  views: number;
  created_at: string;
  xrc_categories: { id: number; name: string; slug: string; icon: string | null; color: string | null } | null;
  xrc_profiles: { id: string; username: string; avatar_url: string | null } | null;
  comment_count: number;
  like_count: number;
};

/* PostgREST 집계 결과([{count}])를 평탄화 */
function normalize(row: any): PostRow {
  return {
    ...row,
    comment_count: row.xrc_comments?.[0]?.count ?? 0,
    like_count: row.xrc_post_likes?.[0]?.count ?? 0,
  };
}

export async function getPosts(
  supabase: SupabaseClient,
  opts: { categorySlug?: string; limit?: number } = {}
): Promise<PostRow[]> {
  let query = supabase
    .from("xrc_posts")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 20);

  if (opts.categorySlug) {
    const { data: cat } = await supabase
      .from("xrc_categories")
      .select("id")
      .eq("slug", opts.categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(normalize);
}

export async function getPost(supabase: SupabaseClient, id: number): Promise<PostRow | null> {
  const { data, error } = await supabase.from("xrc_posts").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return normalize(data);
}

export function excerpt(content: string, len = 90): string {
  const t = content.replace(/\s+/g, " ").trim();
  return t.length > len ? t.slice(0, len) + "…" : t;
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}
