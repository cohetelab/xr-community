import type { SupabaseClient } from "@supabase/supabase-js";

export type Notification = {
  id: number;
  actor_id: string | null;
  type: "comment" | "reply" | "like";
  post_id: number | null;
  is_read: boolean;
  created_at: string;
  actor_name: string;
  post_title: string;
};

export async function getUnreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("xrc_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function getNotifications(supabase: SupabaseClient, userId: string, limit = 40): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("xrc_notifications")
    .select("id, actor_id, type, post_id, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  const actorIds = [...new Set(data.map((n) => n.actor_id).filter(Boolean))] as string[];
  const postIds = [...new Set(data.map((n) => n.post_id).filter(Boolean))] as number[];

  const [actorsRes, postsRes] = await Promise.all([
    actorIds.length ? supabase.from("xrc_profiles").select("id,username").in("id", actorIds) : Promise.resolve({ data: [] }),
    postIds.length ? supabase.from("xrc_posts").select("id,title").in("id", postIds) : Promise.resolve({ data: [] }),
  ]);
  const actors: Record<string, string> = {};
  (actorsRes.data || []).forEach((a: any) => { actors[a.id] = a.username; });
  const posts: Record<number, string> = {};
  (postsRes.data || []).forEach((p: any) => { posts[p.id] = p.title; });

  return data.map((n: any) => ({
    ...n,
    actor_name: n.actor_id ? actors[n.actor_id] || "누군가" : "누군가",
    post_title: n.post_id ? posts[n.post_id] || "(삭제된 글)" : "(삭제된 글)",
  }));
}

export function notifText(type: string): string {
  if (type === "reply") return "님이 답글을 남겼어요";
  if (type === "comment") return "님이 댓글을 남겼어요";
  if (type === "like") return "님이 좋아요를 눌렀어요";
  return "님의 활동";
}
