/* ============================================================
   auth.js — 로그인/회원가입 페이지 (placeholder demo, self-contained)
   ============================================================ */

/* URL 해시(#signup)로 기본 탭 선택 */
const initial = location.hash === "#signup" ? "signup" : "login";

function showTab(name) {
  document.querySelectorAll("[data-authtabs] .auth-tab").forEach(t =>
    t.classList.toggle("is-active", t.dataset.tab === name));
  document.querySelectorAll(".auth-form").forEach(f =>
    f.classList.toggle("is-active", f.dataset.form === name));
}
showTab(initial);

document.querySelectorAll("[data-authtabs] .auth-tab").forEach(tab => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

/* 간단 검증 헬퍼 */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function setErr(input, msg) {
  const box = input.closest("div")?.querySelector("[data-err]");
  if (box) box.textContent = msg || "";
  return !msg;
}

/* 로그인 제출 */
document.querySelector('[data-form="login"]')?.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("li-email");
  const pw = document.getElementById("li-pw");
  let ok = true;
  ok = setErr(email, isEmail(email.value) ? "" : "올바른 이메일을 입력하세요.") && ok;
  ok = setErr(pw, pw.value.length >= 1 ? "" : "비밀번호를 입력하세요.") && ok;
  if (!ok) return;
  alert("로그인되었습니다! (데모 — Supabase Auth 연동 후 실제 동작합니다)");
  location.href = "index.html";
});

/* 회원가입 제출 */
document.querySelector('[data-form="signup"]')?.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("su-email");
  const nick = document.getElementById("su-nick");
  const pw = document.getElementById("su-pw");
  const pw2 = document.getElementById("su-pw2");
  const agree = document.querySelector("[data-agree]");
  let ok = true;
  ok = setErr(email, isEmail(email.value) ? "" : "올바른 이메일을 입력하세요.") && ok;
  ok = setErr(nick, nick.value.trim().length >= 2 ? "" : "닉네임은 2자 이상이어야 해요.") && ok;
  ok = setErr(pw, pw.value.length >= 8 ? "" : "비밀번호는 8자 이상이어야 해요.") && ok;
  ok = setErr(pw2, pw.value === pw2.value ? "" : "비밀번호가 일치하지 않아요.") && ok;
  if (!ok) return;
  if (!agree.checked) { alert("약관에 동의해주세요."); return; }
  alert("회원가입이 완료되었습니다! (데모 — Supabase Auth 연동 후 실제 동작합니다)");
  showTab("login");
});

/* 소셜 로그인 (데모) */
document.querySelectorAll(".social-btn").forEach(btn => {
  btn.addEventListener("click", () =>
    alert("소셜 로그인은 Supabase OAuth 연동 후 동작합니다. (데모)"));
});
