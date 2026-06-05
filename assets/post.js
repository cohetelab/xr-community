/* ============================================================
   post.js — 글 상세 페이지 (placeholder demo, self-contained)
   ============================================================ */

const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* 초기 댓글 데이터 */
let COMMENTS = [
  { name: "겜잘알", op: false, time: "1시간 전", text: "설정 값 정리 감사합니다! 모션 블러 끄니까 진짜 멀미가 덜하네요.", likes: 12, reply: false },
  { name: "플레이어01", op: true, time: "55분 전", text: "도움 되셨다니 다행이에요 ㅎㅎ 후반 난이도 구간은 천천히 적응하시면 됩니다.", likes: 4, reply: true },
  { name: "초보러", op: false, time: "40분 전", text: "입문용으로 살까 고민 중인데 이 글 보고 결정했어요. 같이 멀티 가능할까요?", likes: 7, reply: false },
  { name: "주말전사", op: false, time: "12분 전", text: "주말 저녁에 같이 하실 분 모집 글도 올라와 있던데 거기서 만나요!", likes: 2, reply: false },
];

const listEl = document.querySelector("[data-cmtlist]");
const countEls = [document.querySelector("[data-cmtcount]")];

function commentItem(c) {
  return `
    <li class="comment${c.reply ? " reply" : ""}">
      <span class="avatar">${esc(c.name[0])}</span>
      <div class="c-main">
        <div class="c-top">
          <span class="c-name">${esc(c.name)}</span>
          ${c.op ? `<span class="c-badge op">작성자</span>` : ""}
          <span class="c-time">${esc(c.time)}</span>
        </div>
        <p class="c-text">${esc(c.text)}</p>
        <div class="c-actions">
          <button data-clike>♥ <span>${c.likes}</span></button>
          <button data-creply>답글</button>
        </div>
      </div>
    </li>`;
}

function render() {
  listEl.innerHTML = COMMENTS.map(commentItem).join("");
  countEls.forEach(el => { if (el) el.textContent = COMMENTS.length; });
  bindCommentActions();
}

function bindCommentActions() {
  listEl.querySelectorAll("[data-clike]").forEach(btn => {
    btn.addEventListener("click", () => {
      const span = btn.querySelector("span");
      const liked = btn.classList.toggle("liked");
      span.textContent = Number(span.textContent) + (liked ? 1 : -1);
    });
  });
  listEl.querySelectorAll("[data-creply]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector("[data-cmtform] textarea").focus();
    });
  });
}

/* 좋아요(본문) 토글 */
const likeBtn = document.querySelector("[data-like]");
likeBtn?.addEventListener("click", () => {
  const num = document.querySelector("[data-likecount]");
  const on = likeBtn.classList.toggle("on");
  num.textContent = Number(num.textContent) + (on ? 1 : -1);
});

/* 댓글 등록 */
document.querySelector("[data-cmtform]")?.addEventListener("submit", e => {
  e.preventDefault();
  const ta = e.target.querySelector("textarea");
  const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  COMMENTS.push({ name: "나", op: false, time: "방금", text, likes: 0, reply: false });
  ta.value = "";
  render();
  listEl.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* 모바일 네비 토글 */
document.querySelector("[data-nav-toggle]")?.addEventListener("click", () =>
  document.querySelector(".main-nav").classList.toggle("open"));

render();
