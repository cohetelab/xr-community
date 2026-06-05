/* ============================================================
   write.js — 글쓰기 페이지 (placeholder demo, self-contained)
   ============================================================ */

const titleEl = document.querySelector("[data-title]");
const countEl = document.querySelector("[data-titlecount]");

titleEl?.addEventListener("input", () => {
  countEl.textContent = `${titleEl.value.length} / 100`;
});

/* 첨부 드롭존 (데모) */
document.querySelector("[data-drop]")?.addEventListener("click", () => {
  alert("데모 버전이라 실제 첨부는 동작하지 않아요. Supabase 연동 후 가능해집니다.");
});

/* 서식 버튼 (데모) */
document.querySelectorAll(".editor-toolbar .tool").forEach(btn => {
  btn.addEventListener("click", () => document.querySelector("[data-content]").focus());
});

/* 임시저장 (데모) */
document.querySelector("[data-draft]")?.addEventListener("click", () => {
  const data = {
    board: document.querySelector("[data-board]").value,
    cat: document.querySelector("[data-cat]").value,
    title: titleEl.value,
    content: document.querySelector("[data-content]").value,
    tags: document.querySelector("[data-tags]").value,
  };
  try { localStorage.setItem("xrc-draft", JSON.stringify(data)); } catch (e) {}
  alert("임시저장했어요. (이 브라우저에만 데모로 저장됩니다)");
});

/* 임시저장 복원 */
try {
  const saved = JSON.parse(localStorage.getItem("xrc-draft") || "null");
  if (saved && confirm("임시저장된 글이 있어요. 불러올까요?")) {
    document.querySelector("[data-board]").value = saved.board || "";
    document.querySelector("[data-cat]").value = saved.cat || "";
    titleEl.value = saved.title || "";
    document.querySelector("[data-content]").value = saved.content || "";
    document.querySelector("[data-tags]").value = saved.tags || "";
    countEl.textContent = `${titleEl.value.length} / 100`;
  }
} catch (e) {}

/* 등록 (데모) */
document.querySelector("[data-writeform]")?.addEventListener("submit", e => {
  e.preventDefault();
  const board = document.querySelector("[data-board]").value;
  const title = titleEl.value.trim();
  const content = document.querySelector("[data-content]").value.trim();

  if (!board) { alert("게시판을 선택해주세요."); return; }
  if (!title) { alert("제목을 입력해주세요."); titleEl.focus(); return; }
  if (content.length < 5) { alert("내용을 5자 이상 입력해주세요."); return; }

  try { localStorage.removeItem("xrc-draft"); } catch (e) {}
  alert("등록되었습니다! (데모 — Supabase 연동 후 실제 저장됩니다)");
  location.href = "post.html";
});

/* 모바일 네비 */
document.querySelector("[data-nav-toggle]")?.addEventListener("click", () =>
  document.querySelector(".main-nav").classList.toggle("open"));
