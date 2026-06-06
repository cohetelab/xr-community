"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookmarkButton({
  postId,
  initiallySaved,
  isLoggedIn,
}: {
  postId: number;
  initiallySaved: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const next = !saved;
    setSaved(next);
    if (next) await supabase.from("xrc_bookmarks").insert({ post_id: postId, user_id: user.id });
    else await supabase.from("xrc_bookmarks").delete().eq("post_id", postId).eq("user_id", user.id);
    setBusy(false);
  }

  return (
    <button className="react-btn" onClick={toggle} disabled={busy} style={saved ? { borderColor: "var(--blue)", color: "var(--blue)" } : undefined}>
      {saved ? "🔖 저장됨" : "🔖 저장"}
    </button>
  );
}
