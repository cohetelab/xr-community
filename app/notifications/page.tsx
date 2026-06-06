import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, notifText } from "@/lib/notifications";
import { timeAgo } from "@/lib/posts";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = { comment: "💬", reply: "↩️", like: "❤️" };

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  // 목록을 먼저 읽고(읽음 표시 위해) → 모두 읽음 처리
  const items = await getNotifications(supabase, user.id);
  await supabase.rpc("xrc_mark_notifications_read");

  return (
    <main className="page" style={{ maxWidth: 760 }}>
      <div className="feed-head" style={{ marginBottom: 16 }}>
        <h3>🔔 알림</h3>
        <Link href="/" className="btn btn-outline">홈으로</Link>
      </div>

      {items.length ? (
        <ul className="notif-list">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={n.post_id ? `/post/${n.post_id}` : "#"} className={`notif ${n.is_read ? "" : "unread"}`}>
                <span className="ico">{ICON[n.type] || "🔔"}</span>
                <span className="n-main">
                  <span className="n-text"><b>{n.actor_name}</b>{notifText(n.type)}</span>
                  <div className="n-sub">{n.post_title}</div>
                </span>
                <span className="n-time">{timeAgo(n.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">아직 알림이 없어요. 글을 쓰고 활동을 시작해보세요!</div>
      )}
    </main>
  );
}
