"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

const TAGS = ["후기", "추천", "모집", "질문"];

type Initial = {
  id: number;
  category_id: number;
  tag: string | null;
  title: string;
  content: string;
  tags: string[] | null;
  image_urls: string[] | null;
};

export default function WriteForm({
  categories,
  authorId,
  initial,
}: {
  categories: Category[];
  authorId: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const editing = !!initial;
  const [categoryId, setCategoryId] = useState(initial ? String(initial.category_id) : "");
  const [tag, setTag] = useState(initial?.tag || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(", "));
  const [images, setImages] = useState<string[]>(initial?.image_urls || []);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setMsg("");
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${authorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("xrc-media").upload(path, file, { upsert: false });
      if (error) { setMsg("이미지 업로드 실패: " + error.message); continue; }
      const { data } = supabase.storage.from("xrc-media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!categoryId) { setMsg("게시판을 선택해주세요."); return; }
    if (!title.trim()) { setMsg("제목을 입력해주세요."); return; }
    if (content.trim().length < 5) { setMsg("내용을 5자 이상 입력해주세요."); return; }

    setBusy(true);
    const supabase = createClient();
    const tags = tagsInput.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category_id: Number(categoryId),
      tag: tag || null,
      tags: tags.length ? tags : null,
      image_urls: images.length ? images : null,
    };

    if (editing) {
      const { error } = await supabase
        .from("xrc_posts")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", initial!.id);
      if (error) { setMsg("수정 실패: " + error.message); setBusy(false); return; }
      router.push(`/post/${initial!.id}`);
    } else {
      const { data, error } = await supabase
        .from("xrc_posts")
        .insert({ ...payload, author_id: authorId })
        .select("id")
        .single();
      if (error || !data) { setMsg("등록 실패: " + (error?.message || "오류")); setBusy(false); return; }
      router.push(`/post/${data.id}`);
    }
    router.refresh();
  }

  return (
    <form className="write-card" onSubmit={submit}>
      <h1>{editing ? "✏️ 글 수정" : "✏️ 글쓰기"}</h1>

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
        <textarea id="content" className="area" placeholder="내용을 입력하세요."
          value={content} onChange={(e) => setContent(e.target.value)} />
      </div>

      <div className="form-row">
        <label>이미지 첨부</label>
        <label className="dropzone" style={{ display: "block", cursor: uploading ? "wait" : "pointer" }}>
          {uploading ? "업로드 중…" : "📷 클릭해서 이미지 선택 (여러 장 가능)"}
          <input type="file" accept="image/*" multiple onChange={onPickFiles} hidden disabled={uploading} />
        </label>
        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {images.map((url) => (
              <div key={url} style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                <button type="button" onClick={() => removeImage(url)}
                  style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", border: 0, background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="tags">태그</label>
        <input id="tags" className="field" type="text"
          placeholder="쉼표(,)로 구분 — 예: 신작게임, 후기, 설정팁"
          value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      {msg && <p className="form-msg error">{msg}</p>}

      <div className="write-actions">
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>취소</button>
        <button type="submit" className="btn btn-primary" disabled={busy || uploading}>
          {busy ? "저장 중…" : editing ? "수정 완료" : "등록"}
        </button>
      </div>
    </form>
  );
}
