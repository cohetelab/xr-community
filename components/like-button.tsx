"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LikeButton({
  postId,
  initialCount,
  initiallyLiked,
  isLoggedIn,
}: {
  postId: number;
  initialCount: number;
  initiallyLiked: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initiallyLiked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 낙관적 업데이트
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    if (next) {
      await supabase.from("xrc_post_likes").insert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("xrc_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    }
    setBusy(false);
  }

  return (
    <button className={`react-btn like ${liked ? "on" : ""}`} onClick={toggle} disabled={busy}>
      ♥ 좋아요 <span className="num">{count}</span>
    </button>
  );
}
