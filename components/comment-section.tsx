"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/posts";

type CommentItem = {
  id: number;
  content: string;
  author_id: string;
  parent_id: number | null;
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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  async function add(content: string, parentId: number | null) {
    if (!currentUser) { router.push("/login"); return null; }
    const body = content.trim();
    if (!body) return null;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("xrc_comments")
      .insert({ post_id: postId, author_id: currentUser.id, content: body, parent_id: parentId })
      .select("id, content, author_id, parent_id, created_at")
      .single();
    if (error || !data) { alert("댓글 등록 실패: " + (error?.message || "")); return null; }
    setComments((cs) => [...cs, { ...data, xrc_profiles: { username: currentUser.username } }]);
    return data;
  }

  async function submitTop(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await add(text, null);
    if (r) setText("");
    setBusy(false);
  }

  async function submitReply(parentId: number) {
    if (busy) return;
    setBusy(true);
    const r = await add(replyText, parentId);
    if (r) { setReplyText(""); setReplyTo(null); }
    setBusy(false);
  }

  async function remove(id: number) {
    if (!confirm("댓글을 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("xrc_comments").delete().eq("id", id);
    if (!error) setComments((cs) => cs.filter((c) => c.id !== id && c.parent_id !== id));
  }

  const tops = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: number) => comments.filter((c) => c.parent_id === id);

  function renderComment(c: CommentItem, isReply: boolean) {
    const name = c.xrc_profiles?.username || "익명";
    const isOp = c.author_id === postAuthorId;
    const mine = currentUser?.id === c.author_id;
    return (
      <li className={`comment ${isReply ? "reply" : ""}`} key={c.id}>
        <span className="avatar">{name[0]}</span>
        <div className="c-main">
          <div className="c-top">
            <span className="c-name">{name}</span>
            {isOp && <span className="c-badge op">작성자</span>}
            <span className="c-time">{timeAgo(c.created_at)}</span>
          </div>
          <p className="c-text">{c.content}</p>
          <div className="c-actions">
            {!isReply && currentUser && (
              <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); }}>
                {replyTo === c.id ? "취소" : "답글"}
              </button>
            )}
            {mine && <button onClick={() => remove(c.id)}>삭제</button>}
          </div>

          {replyTo === c.id && (
            <div className="comment-form" style={{ marginTop: 10, marginBottom: 4 }}>
              <textarea placeholder="답글을 입력하세요" value={replyText}
                onChange={(e) => setReplyText(e.target.value)} style={{ minHeight: 60 }} />
              <div className="form-foot">
                <button className="btn btn-primary" disabled={busy} onClick={() => submitReply(c.id)}>답글 등록</button>
              </div>
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <section className="comments">
      <h3>댓글 <b>{comments.length}</b></h3>

      <form className="comment-form" onSubmit={submitTop}>
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
        {tops.map((c) => (
          <div key={c.id}>
            {renderComment(c, false)}
            {repliesOf(c.id).map((r) => renderComment(r, true))}
          </div>
        ))}
        {comments.length === 0 && <li className="empty" style={{ marginTop: 4 }}>첫 댓글을 남겨보세요!</li>}
      </ul>
    </section>
  );
}
