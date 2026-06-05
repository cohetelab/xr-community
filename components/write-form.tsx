"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

const TAGS = ["후기", "추천", "모집", "질문"];

export default function WriteForm({
  categories,
  authorId,
}: {
  categories: Category[];
  authorId: string;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!categoryId) { setMsg("게시판을 선택해주세요."); return; }
    if (!title.trim()) { setMsg("제목을 입력해주세요."); return; }
    if (content.trim().length < 5) { setMsg("내용을 5자 이상 입력해주세요."); return; }

    setBusy(true);
    const supabase = createClient();
    const tags = tagsInput.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);

    const { data, error } = await supabase
      .from("xrc_posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        category_id: Number(categoryId),
        author_id: authorId,
        tag: tag || null,
        tags: tags.length ? tags : null,
      })
      .select("id")
      .single();

    if (error || !data) {
      setMsg("등록 실패: " + (error?.message || "알 수 없는 오류"));
      setBusy(false);
      return;
    }
    router.push(`/post/${data.id}`);
    router.refresh();
  }

  return (
    <form className="write-card" onSubmit={submit}>
      <h1>✏️ 글쓰기</h1>

      <div className="form-row">
        <div className="field-group">
          <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="게시판">
            <option value="">게시판 선택</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="field" value={tag} onChange={(e) => setTag(e.target.value)} aria-label="말머리">
            <option value="">말머리</option>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="title">제목</label>
        <input id="title" className="field" type="text" maxLength={100}
          placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-row">
        <label htmlFor="content">내용</label>
        <textarea id="content" className="area" placeholder="내용을 입력하세요. 따뜻한 커뮤니티를 함께 만들어요."
          value={content} onChange={(e) => setContent(e.target.value)} />
      </div>

      <div className="form-row">
        <label htmlFor="tags">태그</label>
        <input id="tags" className="field" type="text"
          placeholder="쉼표(,)로 구분 — 예: 신작게임, 후기, 설정팁"
          value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      {msg && <p className="form-msg error">{msg}</p>}

      <div className="write-actions">
        <button type="button" className="btn btn-outline" onClick={() => router.push("/board")}>취소</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "등록 중…" : "등록"}</button>
      </div>
    </form>
  );
}
