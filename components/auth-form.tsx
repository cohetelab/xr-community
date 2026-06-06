"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "./brand-mark";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function AuthForm({ initialTab, next }: { initialTab: "login" | "signup"; next: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [nick, setNick] = useState("");
  const [msg, setMsg] = useState<{ t: "error" | "ok"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function go(t: "login" | "signup" | "forgot") { setTab(t); setMsg(null); }

  async function oauth(provider: "google" | "kakao") {
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setMsg({ t: "error", m: `${provider} 로그인 실패: ${error.message}` });
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!isEmail(email)) return setMsg({ t: "error", m: "올바른 이메일을 입력하세요." });
    if (!pw) return setMsg({ t: "error", m: "비밀번호를 입력하세요." });
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return setMsg({ t: "error", m: "로그인 실패: 이메일 또는 비밀번호를 확인하세요." });
    router.push(next);
    router.refresh();
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!isEmail(email)) return setMsg({ t: "error", m: "올바른 이메일을 입력하세요." });
    if (nick.trim().length < 2) return setMsg({ t: "error", m: "닉네임은 2자 이상이어야 해요." });
    if (pw.length < 8) return setMsg({ t: "error", m: "비밀번호는 8자 이상이어야 해요." });
    if (pw !== pw2) return setMsg({ t: "error", m: "비밀번호가 일치하지 않아요." });
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password: pw, options: { data: { username: nick.trim() } },
    });
    setBusy(false);
    if (error) return setMsg({ t: "error", m: "가입 실패: " + error.message });
    if (data.session) { router.push(next); router.refresh(); }
    else { setMsg({ t: "ok", m: "가입 완료! 이메일 인증이 필요한 설정이면 메일함을 확인하세요." }); go("login"); }
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!isEmail(email)) return setMsg({ t: "error", m: "올바른 이메일을 입력하세요." });
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset`,
    });
    setBusy(false);
    if (error) return setMsg({ t: "error", m: "전송 실패: " + error.message });
    setMsg({ t: "ok", m: "비밀번호 재설정 메일을 보냈어요. 메일함을 확인하세요." });
  }

  const social = (
    <>
      <div className="divider">또는</div>
      <div className="social">
        <button type="button" className="social-btn" onClick={() => oauth("google")}>🟦 Google로 계속하기</button>
        <button type="button" className="social-btn kakao" onClick={() => oauth("kakao")}>💬 카카오로 계속하기</button>
      </div>
    </>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span style={{ color: "var(--blue)", display: "flex" }}><BrandMark size={26} /></span>
          <span className="brand-name">XR <b>커뮤니티</b></span>
        </div>
        <p className="auth-sub">XR 사용자들과 경험을 나누세요</p>

        {tab !== "forgot" && (
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "is-active" : ""}`} onClick={() => go("login")}>로그인</button>
            <button className={`auth-tab ${tab === "signup" ? "is-active" : ""}`} onClick={() => go("signup")}>회원가입</button>
          </div>
        )}

        {tab === "login" && (
          <form className="auth-form" onSubmit={login}>
            <div>
              <label htmlFor="li-email">이메일</label>
              <input id="li-email" className="field" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="li-pw">비밀번호</label>
              <input id="li-pw" className="field" type="password" placeholder="비밀번호"
                value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
            </div>
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <button type="button" className="auth-link" style={{ background: "none", border: 0, cursor: "pointer", fontSize: 13 }} onClick={() => go("forgot")}>비밀번호를 잊으셨나요?</button>
            </div>
            {msg && <p className={`form-msg ${msg.t}`}>{msg.m}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "처리 중…" : "로그인"}</button>
            {social}
          </form>
        )}

        {tab === "signup" && (
          <form className="auth-form" onSubmit={signup}>
            <div>
              <label htmlFor="su-email">이메일</label>
              <input id="su-email" className="field" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="su-nick">닉네임</label>
              <input id="su-nick" className="field" type="text" placeholder="커뮤니티에서 사용할 이름" maxLength={20}
                value={nick} onChange={(e) => setNick(e.target.value)} />
            </div>
            <div>
              <label htmlFor="su-pw">비밀번호</label>
              <input id="su-pw" className="field" type="password" placeholder="8자 이상"
                value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="su-pw2">비밀번호 확인</label>
              <input id="su-pw2" className="field" type="password" placeholder="비밀번호 다시 입력"
                value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            </div>
            {msg && <p className={`form-msg ${msg.t}`}>{msg.m}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "처리 중…" : "회원가입"}</button>
            {social}
          </form>
        )}

        {tab === "forgot" && (
          <form className="auth-form" onSubmit={forgot}>
            <p className="auth-sub" style={{ marginBottom: 6 }}>가입한 이메일로 재설정 링크를 보내드려요.</p>
            <div>
              <label htmlFor="fg-email">이메일</label>
              <input id="fg-email" className="field" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            {msg && <p className={`form-msg ${msg.t}`}>{msg.m}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "전송 중…" : "재설정 메일 보내기"}</button>
            <button type="button" className="btn btn-outline" onClick={() => go("login")}>← 로그인으로</button>
          </form>
        )}

        <p className="auth-foot"><Link href="/" style={{ color: "var(--muted)" }}>← 홈으로</Link></p>
      </div>
    </div>
  );
}
