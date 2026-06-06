import type { SupabaseClient } from "@supabase/supabase-js";

/* 프로필은 author_id가 auth.users를 참조하므로 PostgREST 임베드가 불가.
   → 카테고리/카운트만 임베드하고 프로필은 별도 조회 후 병합한다. */
const SELECT = "*, xrc_categories(*), xrc_comments(count), xrc_post_likes(count)";

type ProfileLite = { id: string; username: string; avatar_url: string | null };

export type PostRow = {
  id: number;
  title: string;
  content: string;
  category_id: number;
  author_id: string;
  tag: string | null;
  tags: string[] | null;
  image_urls: string[] | null;
  views: number;
  created_at: string;
  xrc_categories: { id: number; name: string; slug: string; icon: string | null; color: string | null } | null;
  xrc_profiles: ProfileLite | null;
  comment_count: number;
  like_count: number;
};

/* RPC(xrc_list_posts)의 평탄한 행 → PostRow 형태로 매핑 (클라이언트 무한스크롤에서도 사용) */
export function fromRpc(r: any): PostRow {
  return {
    id: r.id, title: r.title, content: r.content, category_id: r.category_id,
    author_id: r.author_id, tag: r.tag, tags: r.tags, image_urls: r.image_urls,
    views: r.views, created_at: r.created_at,
    xrc_categories: r.cat_name
      ? { id: r.category_id, name: r.cat_name, slug: r.cat_slug, icon: r.cat_icon, color: r.cat_color }
      : null,
    xrc_profiles: r.author_name ? { id: r.author_id, username: r.author_name, avatar_url: r.author_avatar } : null,
    comment_count: Number(r.comment_count) || 0,
    like_count: Number(r.like_count) || 0,
  };
}

export type ListOpts = { categorySlug?: string; search?: string; sort?: string; limit?: number; offset?: number };

/* 목록 + 총개수 (검색/정렬/페이지네이션) */
export async function listPosts(
  supabase: SupabaseClient,
  opts: ListOpts = {}
): Promise<{ posts: PostRow[]; total: number }> {
  const params = {
    p_category: opts.categorySlug ?? null,
    p_search: opts.search ?? null,
    p_sort: opts.sort ?? "latest",
    p_limit: opts.limit ?? 20,
    p_offset: opts.offset ?? 0,
  };
  const [{ data, error }, { data: total }] = await Promise.all([
    supabase.rpc("xrc_list_posts", params),
    supabase.rpc("xrc_count_posts", { p_category: params.p_category, p_search: params.p_search }),
  ]);
  if (error || !data) return { posts: [], total: 0 };
  return { posts: (data as any[]).map(fromRpc), total: Number(total) || 0 };
}

function normalize(row: any, profiles: Record<string, ProfileLite>): PostRow {
  return {
    ...row,
    xrc_profiles: profiles[row.author_id] ?? null,
    comment_count: row.xrc_comments?.[0]?.count ?? 0,
    like_count: row.xrc_post_likes?.[0]?.count ?? 0,
  };
}

async function fetchProfiles(supabase: SupabaseClient, ids: string[]): Promise<Record<string, ProfileLite>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return {};
  const { data } = await supabase.from("xrc_profiles").select("id,username,avatar_url").in("id", unique);
  const map: Record<string, ProfileLite> = {};
  (data || []).forEach((p: any) => { map[p.id] = p; });
  return map;
}

export async function getPosts(
  supabase: SupabaseClient,
  opts: { categorySlug?: string; limit?: number } = {}
): Promise<PostRow[]> {
  let query = supabase
    .from("xrc_posts")
    .select(SELECT)
    .eq("is_hidden", false)
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
  const profiles = await fetchProfiles(supabase, data.map((r: any) => r.author_id));
  return data.map((r) => normalize(r, profiles));
}

export async function getPostsByAuthor(supabase: SupabaseClient, authorId: string, limit = 30): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("xrc_posts")
    .select(SELECT)
    .eq("author_id", authorId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const profiles = await fetchProfiles(supabase, data.map((r: any) => r.author_id));
  return data.map((r) => normalize(r, profiles));
}

export async function getPost(supabase: SupabaseClient, id: number): Promise<PostRow | null> {
  const { data, error } = await supabase.from("xrc_posts").select(SELECT).eq("id", id).eq("is_hidden", false).maybeSingle();
  if (error || !data) return null;
  const profiles = await fetchProfiles(supabase, [(data as any).author_id]);
  return normalize(data, profiles);
}

export type CommentRow = {
  id: number;
  content: string;
  author_id: string;
  parent_id: number | null;
  created_at: string;
  xrc_profiles?: { username: string } | null;
};

export async function getComments(supabase: SupabaseClient, postId: number): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("xrc_comments")
    .select("id, content, author_id, parent_id, created_at")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const profiles = await fetchProfiles(supabase, data.map((r: any) => r.author_id));
  return data.map((c: any) => ({ ...c, xrc_profiles: profiles[c.author_id] ? { username: profiles[c.author_id].username } : null }));
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
