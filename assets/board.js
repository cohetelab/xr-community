/* ============================================================
   board.js — 게시판 목록 페이지 (placeholder demo, self-contained)
   ============================================================ */

/* 공지(상단 고정) */
const NOTICES = [
  { cat: "공지", title: "게시판 이용 규칙 안내", author: "운영팀", date: "고정", view: 24010, cmt: 5 },
  { cat: "공지", title: "신고/제재 정책 업데이트", author: "운영팀", date: "고정", view: 8800, cmt: 2 },
];

/* 일반 글 */
const THREADS = [
  { no: 1284, cat: "후기", title: "이번 주 신작 액션 게임 플레이 후기", author: "플레이어01", date: "06-05", view: 342, like: 28, cmt: 12, isNew: true },
  { no: 1283, cat: "모집", title: "멀티플레이 같이 할 사람 모집 (한국 서버 / 주말 저녁)", author: "길드장", date: "06-05", view: 631, like: 42, cmt: 312, isNew: true },
  { no: 1282, cat: "추천", title: "입문자에게 추천하는 무료 게임 5선", author: "큐레이터", date: "06-04", view: 1820, like: 156, cmt: 47 },
  { no: 1281, cat: "질문", title: "이 게임 멀미 심한 편인가요? 후기 부탁드려요", author: "초보user", date: "06-04", view: 210, like: 8, cmt: 19 },
  { no: 1280, cat: "후기", title: "리듬게임 3개월 정주행 후기 (난이도별 정리)", author: "비트러", date: "06-04", view: 905, like: 73, cmt: 26 },
  { no: 1279, cat: "추천", title: "협동 플레이 명작 모음 — 친구랑 할 게임 찾는다면", author: "코옵러버", date: "06-03", view: 1442, like: 121, cmt: 38 },
  { no: 1278, cat: "후기", title: "스포츠 게임 운동 효과 진짜 있나? 한 달 기록", author: "헬스러", date: "06-03", view: 2310, like: 204, cmt: 55 },
  { no: 1277, cat: "질문", title: "컨트롤러 드리프트 현상 해결하신 분 계신가요", author: "수리수리", date: "06-03", view: 388, like: 15, cmt: 22 },
  { no: 1276, cat: "모집", title: "주 1회 보드게임 모임 멤버 구합니다", author: "보드장인", date: "06-02", view: 540, like: 31, cmt: 14 },
  { no: 1275, cat: "후기", title: "공포게임 혼자 클리어 도전기 (심장 주의)", author: "겁쟁이", date: "06-02", view: 3120, like: 288, cmt: 91 },
  { no: 1274, cat: "추천", title: "그래픽 최강 타이틀 비교 — 사양별 추천", author: "그래픽덕", date: "06-02", view: 1760, like: 142, cmt: 33 },
  { no: 1273, cat: "후기", title: "퍼즐 게임 추천받아서 해봤는데 시간 순삭", author: "퍼즐러", date: "06-01", view: 670, like: 49, cmt: 18 },
];

const RANKS = [
  { title: "공포게임 혼자 클리어 도전기", sub: "후기 · 댓글 91" },
  { title: "스포츠 게임 운동 효과 진짜 있나?", sub: "후기 · 댓글 55" },
  { title: "멀티플레이 같이 할 사람 모집", sub: "모집 · 댓글 312" },
  { title: "입문자에게 추천하는 무료 게임 5선", sub: "추천 · 댓글 47" },
  { title: "협동 플레이 명작 모음", sub: "추천 · 댓글 38" },
];

const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function noticeRow(n) {
  return `
    <li class="thread is-notice">
      <div class="th-no"><span class="badge-notice">공지</span></div>
      <div class="th-main">
        <span class="th-cat">${esc(n.cat)}</span>
        <a href="post.html" class="th-title">${esc(n.title)}</a>
        <span class="th-cmt">[${n.cmt}]</span>
      </div>
      <div class="th-author"><span class="avatar">${esc(n.author[0])}</span>${esc(n.author)}</div>
      <div class="th-date">${esc(n.date)}</div>
      <div class="th-stats">조회 <b>${n.view.toLocaleString()}</b></div>
    </li>`;
}

function threadRow(t) {
  return `
    <li class="thread">
      <div class="th-no">${t.no}</div>
      <div class="th-main">
        <span class="th-cat">${esc(t.cat)}</span>
        <a href="post.html" class="th-title">${esc(t.title)}</a>
        ${t.cmt ? `<span class="th-cmt">[${t.cmt}]</span>` : ""}
        ${t.isNew ? `<span class="th-new">N</span>` : ""}
      </div>
      <div class="th-author"><span class="avatar">${esc(t.author[0])}</span>${esc(t.author)}</div>
      <div class="th-date">${t.date}</div>
      <div class="th-stats">♥ <b>${t.like}</b> · 조회 ${t.view.toLocaleString()}</div>
    </li>`;
}

document.querySelector("[data-threads]").innerHTML =
  NOTICES.map(noticeRow).join("") + THREADS.map(threadRow).join("");

const rankEl = document.querySelector("[data-ranklist]");
if (rankEl) {
  rankEl.innerHTML = RANKS.map(r => `
    <li><div><div class="rk-title">${esc(r.title)}</div><div class="rk-sub">${esc(r.sub)}</div></div></li>
  `).join("");
}

/* 카테고리 칩 활성화 토글 (데모) */
document.querySelectorAll("[data-chips] .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("[data-chips] .chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
  });
});

/* 모바일 네비 토글 */
document.querySelector("[data-nav-toggle]")?.addEventListener("click", () =>
  document.querySelector(".main-nav").classList.toggle("open"));
