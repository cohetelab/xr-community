import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportItem = {
  id: number;
  reporter_id: string;
  target_type: "post" | "comment";
  post_id: number | null;
  comment_id: number | null;
  reason: string;
  status: string;
  created_at: string;
  reporter_name: string;
  target_preview: string;
  target_hidden: boolean;
};

export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("xrc_profiles").select("is_admin").eq("id", userId).maybeSingle();
  return !!(data as any)?.is_admin;
}

export async function getReports(supabase: SupabaseClient): Promise<ReportItem[]> {
  const { data, error } = await supabase
    .from("xrc_reports")
    .select("id, reporter_id, target_type, post_id, comment_id, reason, status, created_at")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];

  const reporterIds = [...new Set(data.map((r) => r.reporter_id))];
  const postIds = [...new Set(data.filter((r) => r.post_id).map((r) => r.post_id))] as number[];
  const commentIds = [...new Set(data.filter((r) => r.comment_id).map((r) => r.comment_id))] as number[];

  const [rep, posts, comments] = await Promise.all([
    reporterIds.length ? supabase.from("xrc_profiles").select("id,username").in("id", reporterIds) : Promise.resolve({ data: [] }),
    postIds.length ? supabase.from("xrc_posts").select("id,title,is_hidden").in("id", postIds) : Promise.resolve({ data: [] }),
    commentIds.length ? supabase.from("xrc_comments").select("id,content,is_hidden").in("id", commentIds) : Promise.resolve({ data: [] }),
  ]);
  const repMap: Record<string, string> = {};
  (rep.data || []).forEach((p: any) => { repMap[p.id] = p.username; });
  const postMap: Record<number, any> = {};
  (posts.data || []).forEach((p: any) => { postMap[p.id] = p; });
  const cmtMap: Record<number, any> = {};
  (comments.data || []).forEach((c: any) => { cmtMap[c.id] = c; });

  return data.map((r: any) => {
    const post = r.post_id ? postMap[r.post_id] : null;
    const cmt = r.comment_id ? cmtMap[r.comment_id] : null;
    return {
      ...r,
      reporter_name: repMap[r.reporter_id] || "익명",
      target_preview: r.target_type === "post"
        ? (post?.title || "(삭제된 글)")
        : (cmt?.content?.slice(0, 80) || "(삭제된 댓글)"),
      target_hidden: r.target_type === "post" ? !!post?.is_hidden : !!cmt?.is_hidden,
    };
  });
}
