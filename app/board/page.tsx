import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listPosts } from "@/lib/posts";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const SORTS: { key: string; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
  { key: "comments", label: "댓글순" },
  { key: "views", label: "조회순" },
];

function buildQuery(base: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => { if (v) q.set(k, v); });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { cat?: string; q?: string; sort?: string; page?: string };
}) {
  const supabase = createClient();
  const slug = searchParams.cat;
  const search = searchParams.q || "";
  const sort = searchParams.sort || "latest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ data: categories }, { posts, total }] = await Promise.all([
    supabase.from("xrc_categories").select("*").order("id"),
    listPosts(supabase, { categorySlug: slug, search, sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  ]);

  const cats = (categories as Category[]) || [];
  const current = cats.find((c) => c.slug === slug);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const keep = { cat: slug, q: search || undefined, sort: sort !== "latest" ? sort : undefined };

  return (
    <main className="page">
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span>
        <Link href="/board">포럼</Link>
        {current && <><span className="sep">›</span><span>{current.name}</span></>}
      </nav>

      <div className="page-layout">
        <section>
          <div className="board-head">
            <div>
              <h1>{current ? `${current.icon || ""} ${current.name}` : "📋 전체 글"}</h1>
              <p className="board-desc">{search ? `"${search}" 검색 결과 ${total}건` : `총 ${total}개의 글`}</p>
            </div>
            <Link href="/write" className="btn btn-primary">✏️ 글쓰기</Link>
          </div>

          <div className="board-toolbar">
            <div className="chip-row">
              <Link href={buildQuery({ q: search || undefined, sort: keep.sort })} className={`chip ${!slug ? "is-active" : ""}`}>전체</Link>
              {cats.map((c) => (
                <Link key={c.id} href={buildQuery({ cat: c.slug, q: search || undefined, sort: keep.sort })} className={`chip ${slug === c.slug ? "is-active" : ""}`}>
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="toolbar-right">
              <form action="/board" method="get" className="board-search">
                {slug && <input type="hidden" name="cat" value={slug} />}
                {sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
                <input className="field" type="search" name="q" defaultValue={search} placeholder="제목·내용 검색" style={{ height: 36, width: 180 }} />
              </form>
            </div>
          </div>

          <div className="board-toolbar" style={{ justifyContent: "flex-start", gap: 6 }}>
            {SORTS.map((s) => (
              <Link key={s.key} href={buildQuery({ cat: slug, q: search || undefined, sort: s.key !== "latest" ? s.key : undefined })}
                className={`chip ${sort === s.key ? "is-active" : ""}`}>{s.label}</Link>
            ))}
          </div>

          {posts.length ? (
            <ul className="thread-list">
              {posts.map((p, idx) => (
                <li className="thread" key={p.id}>
                  <div className="th-no">{total - (page - 1) * PAGE_SIZE - idx}</div>
                  <div className="th-main">
                    <span className="th-cat">{p.xrc_categories?.name}</span>
                    <Link href={`/post/${p.id}`} className="th-title">{p.title}</Link>
                    {p.image_urls && p.image_urls.length > 0 && <span className="th-cmt" style={{ color: "var(--blue)" }}>📷</span>}
                    {p.comment_count > 0 && <span className="th-cmt">[{p.comment_count}]</span>}
                  </div>
                  <div className="th-author">
                    <span className="avatar">{(p.xrc_profiles?.username || "익")[0]}</span>{p.xrc_profiles?.username || "익명"}
                  </div>
                  <div className="th-stats">♥ <b>{p.like_count}</b> · 조회 {p.views}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              {search ? "검색 결과가 없어요." : "이 게시판에 아직 글이 없어요."} <Link href="/write" style={{ color: "var(--blue)", fontWeight: 700 }}>글 작성하기</Link>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="board-toolbar" style={{ justifyContent: "center", gap: 6, marginTop: 16 }} aria-label="페이지">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((n) => (
                <Link key={n} href={buildQuery({ ...keep, page: n > 1 ? String(n) : undefined })}
                  className={`chip ${n === page ? "is-active" : ""}`}>{n}</Link>
              ))}
            </nav>
          )}

          <div className="board-bottom">
            <Link href="/write" className="btn btn-primary">✏️ 글쓰기</Link>
          </div>
        </section>

        <aside className="sidebar">
          <div className="card">
            <h4 className="card-title">🏷️ 카테고리</h4>
            <div className="tag-cloud">
              <Link href="/board" className="tag">#전체</Link>
              {cats.map((c) => <Link key={c.id} href={`/board?cat=${c.slug}`} className="tag">#{c.name}</Link>)}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
