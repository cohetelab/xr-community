"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsForm({
  userId,
  initialUsername,
  initialAvatar,
}: {
  userId: string;
  initialUsername: string;
  initialAvatar: string | null;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [msg, setMsg] = useState<{ t: "error" | "ok"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("xrc-media").upload(path, file, { upsert: false });
    if (error) { setMsg({ t: "error", m: "업로드 실패: " + error.message }); setUploading(false); return; }
    const { data } = supabase.storage.from("xrc-media").getPublicUrl(path);
    setAvatar(data.publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (username.trim().length < 2) { setMsg({ t: "error", m: "닉네임은 2자 이상이어야 해요." }); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("xrc_profiles")
      .update({ username: username.trim(), avatar_url: avatar })
      .eq("id", userId);
    setBusy(false);
    if (error) { setMsg({ t: "error", m: "저장 실패: " + error.message }); return; }
    setMsg({ t: "ok", m: "저장됐어요." });
    router.refresh();
  }

  return (
    <form className="write-card" onSubmit={save}>
      <h1>⚙️ 설정</h1>

      <div className="form-row">
        <label>프로필 사진</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="아바타" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--line)" }} />
          ) : (
            <span className="avatar" style={{ width: 72, height: 72, fontSize: 30 }}>{username[0] || "?"}</span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <label className="btn btn-outline" style={{ cursor: uploading ? "wait" : "pointer" }}>
              {uploading ? "업로드 중…" : "이미지 변경"}
              <input type="file" accept="image/*" onChange={onAvatar} hidden disabled={uploading} />
            </label>
            {avatar && <button type="button" className="btn btn-ghost" onClick={() => setAvatar(null)}>제거</button>}
          </div>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="nick">닉네임</label>
        <input id="nick" className="field" type="text" maxLength={20}
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="field-hint">다른 사용자에게 표시되는 이름이에요.</div>
      </div>

      {msg && <p className={`form-msg ${msg.t}`}>{msg.m}</p>}

      <div className="write-actions">
        <button type="button" className="btn btn-outline" onClick={() => router.push("/")}>닫기</button>
        <button type="submit" className="btn btn-primary" disabled={busy || uploading}>{busy ? "저장 중…" : "저장"}</button>
      </div>
    </form>
  );
}
