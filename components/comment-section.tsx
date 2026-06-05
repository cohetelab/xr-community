"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/posts";

type CommentItem = {
  id: number;
  content: string;
  author_id: string;
  created_at: string;
  xrc_profiles?: { username: string } | null;
};

export default function CommentSection({
  postId,
  postAuthorId,
  initialComments,
  currentUser,
}: {
  postId: number;
  postAuthorId: string;
  initialComments: CommentItem[];
  currentUser: { id: string; username: string } | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { router.push("/login"); return; }
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("xrc_comments")
      .insert({ post_id: postId, author_id: currentUser.id, content: body })
      .select("id, content, author_id, created_at")
      .single();

    if (!error && data) {
      setComments((cs) => [...cs, { ...data, xrc_profiles: { username: currentUser.username } }]);
      setText("");
    }
    setBusy(false);
  }

  async function remove(id: number) {
    if (!confirm("댓글을 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("xrc_comments").delete().eq("id", id);
    if (!error) setComments((cs) => cs.filter((c) => c.id !== id));
  }

  return (
    <section className="comments">
      <h3>댓글 <b>{comments.length}</b></h3>

      <form className="comment-form" onSubmit={submit}>
        <textarea
          placeholder={currentUser ? "따뜻한 댓글을 남겨주세요." : "로그인 후 댓글을 작성할 수 있어요."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="댓글 입력"
        />
        <div className="form-foot">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {currentUser ? "댓글 등록" : "로그인하고 작성"}
          </button>
        </div>
      </form>

      <ul className="comment-list">
        {comments.map((c) => {
          const name = c.xrc_profiles?.username || "익명";
          const isOp = c.author_id === postAuthorId;
          const mine = currentUser?.id === c.author_id;
          return (
            <li className="comment" key={c.id}>
              <span className="avatar">{name[0]}</span>
              <div className="c-main">
                <div className="c-top">
                  <span className="c-name">{name}</span>
                  {isOp && <span className="c-badge op">작성자</span>}
                  <span className="c-time">{timeAgo(c.created_at)}</span>
                </div>
                <p className="c-text">{c.content}</p>
                {mine && (
                  <div className="c-actions">
                    <button onClick={() => remove(c.id)}>삭제</button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
        {comments.length === 0 && <li className="empty" style={{ marginTop: 4 }}>첫 댓글을 남겨보세요!</li>}
      </ul>
    </section>
  );
}
