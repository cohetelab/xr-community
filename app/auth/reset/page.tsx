"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "@/components/brand-mark";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ t: "error" | "ok"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // 재설정 메일 링크로 들어오면 콜백에서 세션이 생성됨
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) setMsg({ t: "error", m: "유효하지 않거나 만료된 링크예요. 메일을 다시 요청해주세요." });
      setReady(true);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ t: "error", m: "비밀번호는 8자 이상이어야 해요." });
    if (pw !== pw2) return setMsg({ t: "error", m: "비밀번호가 일치하지 않아요." });
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ t: "error", m: "변경 실패: " + error.message });
    setMsg({ t: "ok", m: "비밀번호가 변경됐어요. 잠시 후 홈으로 이동합니다." });
    setTimeout(() => { router.push("/"); router.refresh(); }, 1200);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span style={{ color: "var(--blue)", display: "flex" }}><BrandMark size={26} /></span>
          <span className="brand-name">XR <b>커뮤니티</b></span>
        </div>
        <p className="auth-sub">새 비밀번호 설정</p>

        <form className="auth-form" onSubmit={submit}>
          <div>
            <label htmlFor="np">새 비밀번호</label>
            <input id="np" className="field" type="password" placeholder="8자 이상"
              value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" disabled={!ready} />
          </div>
          <div>
            <label htmlFor="np2">새 비밀번호 확인</label>
            <input id="np2" className="field" type="password" placeholder="다시 입력"
              value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" disabled={!ready} />
          </div>
          {msg && <p className={`form-msg ${msg.t}`}>{msg.m}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy || !ready}>{busy ? "변경 중…" : "비밀번호 변경"}</button>
        </form>
      </div>
    </div>
  );
}
