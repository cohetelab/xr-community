/* ============================================================
   XR 커뮤니티 — 메인 페이지 인터랙션 (placeholder demo)
   ============================================================ */

/* ---------- Placeholder data ---------- */
const POSTS = {
  최신: [
    { cat: "게임", icon: "🎮", t1: "#dfe4ff", t2: "#b9c4ff", title: "이번 주 신작 액션 게임 플레이 후기", excerpt: "그래픽도 좋고 컨트롤러 반응이 정말 부드럽네요. 추천 옵션 값까지 같이 정리했습니다.", author: "플레이어01", time: "10분 전", view: 342, like: 28, comment: 12 },
    { cat: "팁", icon: "💡", t1: "#dcfce7", t2: "#a7f3d0", title: "렌즈 김서림 줄이는 간단한 방법 3가지", excerpt: "겨울철 실내외 온도차로 김서림 생길 때 바로 쓸 수 있는 방법 모음입니다.", author: "꿀팁러", time: "32분 전", view: 1208, like: 96, comment: 41 },
    { cat: "Q&A", icon: "❓", t1: "#fef3c7", t2: "#fde68a", title: "페어링이 자꾸 끊기는데 원인이 뭘까요?", excerpt: "특정 앱에서만 연결이 불안정합니다. 펌웨어는 최신인데 혹시 같은 증상 겪으신 분?", author: "초보user", time: "1시간 전", view: 210, like: 8, comment: 19 },
    { cat: "영상", icon: "🎬", t1: "#ede9fe", t2: "#ddd6fe", title: "직접 찍은 풀트래킹 댄스 영상 공유합니다", excerpt: "셋업 환경이랑 캡처 설정도 댓글에 정리해뒀어요. 피드백 환영!", author: "무빙메이커", time: "2시간 전", view: 876, like: 154, comment: 33 },
    { cat: "개발", icon: "🛠️", t1: "#fee2e2", t2: "#fecaca", title: "유니티로 첫 XR 앱 빌드까지 삽질기", excerpt: "SDK 설정에서 막혔던 부분이랑 해결 방법을 단계별로 적었습니다.", author: "devkim", time: "3시간 전", view: 521, like: 44, comment: 16 },
  ],
  인기: [
    { cat: "팁", icon: "💡", t1: "#dcfce7", t2: "#a7f3d0", title: "초보자가 처음 사면 꼭 해야 할 설정 10가지", excerpt: "구매 직후 이것만 해두면 체감 만족도가 확 올라갑니다. 캡처와 함께 정리.", author: "가이드마스터", time: "어제", view: 8421, like: 612, comment: 188 },
    { cat: "리뷰", icon: "⭐", t1: "#fff7ed", t2: "#fed7aa", title: "한 달 써본 솔직 장단점 총정리", excerpt: "광고 아니고 진짜 솔직 후기입니다. 무게, 화질, 배터리까지 항목별로.", author: "리뷰어J", time: "2일 전", view: 15203, like: 1043, comment: 257 },
    { cat: "게임", icon: "🎮", t1: "#dfe4ff", t2: "#b9c4ff", title: "멀티플레이 같이 할 사람 모집 (한국 서버)", excerpt: "매주 주말 저녁에 모여서 같이 플레이하는 디스코드 채널 운영 중입니다.", author: "길드장", time: "2일 전", view: 6312, like: 421, comment: 312 },
  ],
  주목: [
    { cat: "공지", icon: "📢", t1: "#e0f2fe", t2: "#bae6fd", title: "[공지] 커뮤니티 글쓰기 가이드라인 안내", excerpt: "건강한 커뮤니티를 위한 기본 규칙입니다. 글 작성 전 한 번씩 읽어주세요.", author: "운영팀", time: "고정", view: 24010, like: 88, comment: 5 },
    { cat: "이벤트", icon: "🎁", t1: "#fce7f3", t2: "#fbcfe8", title: "여름 인증샷 챌린지 — 경품 안내", excerpt: "참여 방법과 당첨자 발표 일정을 확인하세요. 누구나 참여 가능합니다.", author: "운영팀", time: "1일 전", view: 9921, like: 530, comment: 144 },
  ],
};

const RANKS = [
  { title: "한 달 써본 솔직 장단점 총정리", sub: "리뷰 · 댓글 257" },
  { title: "초보자가 처음 사면 꼭 해야 할 설정 10가지", sub: "팁 · 댓글 188" },
  { title: "멀티플레이 같이 할 사람 모집", sub: "게임 · 댓글 312" },
  { title: "렌즈 김서림 줄이는 간단한 방법 3가지", sub: "팁 · 댓글 41" },
  { title: "직접 찍은 풀트래킹 댄스 영상", sub: "영상 · 댓글 33" },
];

/* ---------- Render posts ---------- */
const postList = document.querySelector("[data-postlist]");

function renderPosts(key) {
  const items = POSTS[key] || [];
  postList.innerHTML = items.map(p => `
    <li class="post">
      <div class="post-thumb" style="--t1:${p.t1};--t2:${p.t2}">${p.icon}</div>
      <div class="post-main">
        <span class="post-cat">${p.cat}</span>
        <h4 class="post-title">${p.title}</h4>
        <p class="post-excerpt">${p.excerpt}</p>
        <div class="post-meta">
          <span class="post-author"><span class="avatar">${p.author[0]}</span>${p.author}</span>
          <span>${p.time}</span>
          <span class="post-stats">
            <span>👁 ${p.view.toLocaleString()}</span>
            <span>♥ ${p.like}</span>
            <span>💬 ${p.comment}</span>
          </span>
        </div>
      </div>
    </li>`).join("");
}
renderPosts("최신");

/* ---------- Tabs ---------- */
document.querySelectorAll("[data-tab]").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    renderPosts(tab.textContent.trim());
  });
});

/* ---------- Ranking ---------- */
document.querySelector("[data-ranklist]").innerHTML = RANKS.map(r => `
  <li><div><div class="rk-title">${r.title}</div><div class="rk-sub">${r.sub}</div></div></li>
`).join("");

/* ---------- Hero carousel ---------- */
(function heroSlider() {
  const track = document.querySelector("[data-track]");
  const slides = track ? track.children.length : 0;
  if (!track || !slides) return;
  const dotsWrap = document.querySelector("[data-dots]");
  let i = 0, timer;

  for (let s = 0; s < slides; s++) {
    const b = document.createElement("button");
    b.addEventListener("click", () => go(s));
    dotsWrap.appendChild(b);
  }
  const dots = [...dotsWrap.children];

  function go(n) {
    i = (n + slides) % slides;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
    restart();
  }
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); }

  document.querySelector("[data-next]").addEventListener("click", () => go(i + 1));
  document.querySelector("[data-prev]").addEventListener("click", () => go(i - 1));
  go(0);
})();

/* ---------- Mobile nav ---------- */
const navToggle = document.querySelector("[data-nav-toggle]");
if (navToggle) {
  navToggle.addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("open"));
}

/* ---------- Load more (demo) ---------- */
document.querySelector(".load-more")?.addEventListener("click", e => {
  e.target.textContent = "더 이상 글이 없어요 (데모)";
  e.target.disabled = true;
});
