import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-name">XR <b>커뮤니티</b></span>
          <p>XR 사용자들을 위한 비공식 커뮤니티입니다.</p>
        </div>
        <div className="footer-cols">
          <div><h5>커뮤니티</h5><Link href="/board">포럼</Link><Link href="/board?cat=qna">Q&amp;A</Link></div>
          <div><h5>지원</h5><Link href="/board?cat=tip">가이드</Link><Link href="/board">공지</Link></div>
          <div><h5>정책</h5><a href="#">이용약관</a><a href="#">개인정보처리방침</a></div>
        </div>
      </div>
      <div className="footer-bottom container">© 2026 XR 커뮤니티. Built with Next.js + Supabase.</div>
    </footer>
  );
}
