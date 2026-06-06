import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, getReports } from "@/lib/admin";
import AdminReports from "@/components/admin-reports";

export const dynamic = "force-dynamic";

async function countOf(supabase: any, table: string, filter?: { col: string; val: any }) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.val);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin(supabase, user.id))) redirect("/");

  const [reports, posts, comments, users, pending] = await Promise.all([
    getReports(supabase),
    countOf(supabase, "xrc_posts"),
    countOf(supabase, "xrc_comments"),
    countOf(supabase, "xrc_profiles"),
    countOf(supabase, "xrc_reports", { col: "status", val: "pending" }),
  ]);

  return (
    <main className="page">
      <div className="feed-head" style={{ marginBottom: 16 }}>
        <h3>🛡️ 관리자</h3>
        <Link href="/" className="btn btn-outline">홈으로</Link>
      </div>

      <div className="categories" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 0, marginBottom: 24 }}>
        <div className="cat-tile"><b style={{ fontSize: 22 }}>{posts}</b><span>전체 글</span></div>
        <div className="cat-tile"><b style={{ fontSize: 22 }}>{comments}</b><span>전체 댓글</span></div>
        <div className="cat-tile"><b style={{ fontSize: 22 }}>{users}</b><span>회원</span></div>
        <div className="cat-tile"><b style={{ fontSize: 22, color: pending ? "#ef4444" : undefined }}>{pending}</b><span>미처리 신고</span></div>
      </div>

      <div className="feed-head" style={{ marginBottom: 14 }}><h3>🚩 신고 목록</h3></div>
      <AdminReports initial={reports} />
    </main>
  );
}
