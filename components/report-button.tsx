"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReportButton({
  targetType,
  postId,
  commentId,
  isLoggedIn,
}: {
  targetType: "post" | "comment";
  postId?: number;
  commentId?: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function report() {
    if (!isLoggedIn) { router.push("/login"); return; }
    const reason = prompt("신고 사유를 입력해주세요 (스팸, 욕설, 부적절한 내용 등)");
    if (!reason || !reason.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error } = await supabase.from("xrc_reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      post_id: postId ?? null,
      comment_id: commentId ?? null,
      reason: reason.trim(),
    });
    setBusy(false);
    alert(error ? "신고 실패: " + error.message : "신고가 접수됐어요. 운영팀이 검토합니다.");
  }

  return (
    <button className="icon-btn" onClick={report} disabled={busy} title="신고">🚩 신고</button>
  );
}
