"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/posts";
import type { ReportItem } from "@/lib/admin";

export default function AdminReports({ initial }: { initial: ReportItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const supabase = createClient();

  async function resolve(id: number) {
    setBusy(id);
    await supabase.from("xrc_reports").update({ status: "resolved" }).eq("id", id);
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "resolved" } : x)));
    setBusy(null);
  }

  async function hide(r: ReportItem) {
    setBusy(r.id);
    const table = r.target_type === "post" ? "xrc_posts" : "xrc_comments";
    const id = r.target_type === "post" ? r.post_id : r.comment_id;
    if (id) await supabase.from(table).update({ is_hidden: !r.target_hidden }).eq("id", id);
    setItems((xs) => xs.map((x) => (x.id === r.id ? { ...x, target_hidden: !r.target_hidden } : x)));
    setBusy(null);
  }

  async function del(r: ReportItem) {
    if (!confirm("대상 콘텐츠를 영구 삭제할까요?")) return;
    setBusy(r.id);
    const table = r.target_type === "post" ? "xrc_posts" : "xrc_comments";
    const id = r.target_type === "post" ? r.post_id : r.comment_id;
    if (id) await supabase.from(table).delete().eq("id", id);
    await supabase.from("xrc_reports").update({ status: "resolved" }).eq("id", r.id);
    setItems((xs) => xs.map((x) => (x.id === r.id ? { ...x, status: "resolved", target_preview: "(삭제됨)" } : x)));
    setBusy(null);
    router.refresh();
  }

  if (!items.length) return <div className="empty">접수된 신고가 없어요. 👍</div>;

  return (
    <ul className="thread-list">
      {items.map((r) => (
        <li key={r.id} className="thread" style={{ gridTemplateColumns: "1fr", gap: 8, alignItems: "stretch", opacity: r.status === "resolved" ? 0.55 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="c-badge" style={{ background: r.status === "pending" ? "#fee2e2" : "#dcfce7", color: r.status === "pending" ? "#ef4444" : "#16a34a" }}>
              {r.status === "pending" ? "대기" : "처리됨"}
            </span>
            <span className="th-cat">{r.target_type === "post" ? "글" : "댓글"}</span>
            {r.target_hidden && <span className="c-badge">숨김상태</span>}
            <span className="c-time">{timeAgo(r.created_at)} · 신고자 {r.reporter_name}</span>
          </div>
          <div>
            {r.post_id ? (
              <Link href={`/post/${r.post_id}`} className="th-title">{r.target_preview}</Link>
            ) : (
              <span className="th-title">{r.target_preview}</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>사유: {r.reason}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="icon-btn" disabled={busy === r.id} onClick={() => hide(r)}>
              {r.target_hidden ? "숨김 해제" : "숨기기"}
            </button>
            <button className="icon-btn" disabled={busy === r.id} onClick={() => del(r)} style={{ color: "#ef4444" }}>삭제</button>
            {r.status === "pending" && (
              <button className="icon-btn" disabled={busy === r.id} onClick={() => resolve(r.id)}>처리완료</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
