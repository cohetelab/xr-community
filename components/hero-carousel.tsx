"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  { tag: "NEW", title: "차세대 XR 기기, 지금 만나보세요", desc: "커뮤니티에서 가장 먼저 소식을 확인하고 사용자들과 경험을 나눠보세요.", g1: "#3b5bff", g2: "#7c3aed" },
  { tag: "EVENT", title: "여름 인증샷 챌린지 진행 중", desc: "플레이 장면을 공유하고 푸짐한 경품에 도전하세요.", g1: "#0ea5e9", g2: "#2563eb" },
  { tag: "GUIDE", title: "처음이라면 — 시작 가이드 모음", desc: "초기 설정부터 추천 앱까지, 한 번에 정리했어요.", g1: "#f43f5e", g2: "#f97316" },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section className="hero container">
      <div className="hero-slider">
        <div className="hero-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, k) => (
            <article key={k} className="hero-slide" style={{ ["--g1" as any]: s.g1, ["--g2" as any]: s.g2 }}>
              <div className="hero-text">
                <span className="hero-tag">{s.tag}</span>
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
        <button className="hero-arrow prev" onClick={() => go(i - 1)} aria-label="이전">‹</button>
        <button className="hero-arrow next" onClick={() => go(i + 1)} aria-label="다음">›</button>
        <div className="hero-dots">
          {SLIDES.map((_, k) => (
            <button key={k} className={k === i ? "is-active" : ""} onClick={() => go(k)} aria-label={`슬라이드 ${k + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
