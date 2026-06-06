"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostActions({ postId }: { postId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("xrc_posts").delete().eq("id", postId);
    if (error) { alert("삭제 실패: " + error.message); setBusy(false); return; }
    router.push("/board");
    router.refresh();
  }

  return (
    <div className="byline-actions" style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
      <Link href={`/post/${postId}/edit`} className="btn btn-outline" style={{ height: 34 }}>수정</Link>
      <button className="btn btn-outline" style={{ height: 34 }} onClick={del} disabled={busy}>삭제</button>
    </div>
  );
}
