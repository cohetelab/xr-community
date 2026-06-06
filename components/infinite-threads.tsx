"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fromRpc, type PostRow } from "@/lib/posts";

export default function InfiniteThreads({
  initial,
  total,
  categorySlug,
  search,
  sort,
  pageSize,
}: {
  initial: PostRow[];
  total: number;
  categorySlug?: string;
  search: string;
  sort: string;
  pageSize: number;
}) {
  const [items, setItems] = useState<PostRow[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length >= total);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("xrc_list_posts", {
      p_category: categorySlug ?? null,
      p_search: search || null,
      p_sort: sort,
      p_limit: pageSize,
      p_offset: items.length,
    });
    const rows = (data as any[] | null)?.map(fromRpc) ?? [];
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const merged = [...prev, ...rows.filter((r) => !seen.has(r.id))];
      if (rows.length < pageSize || merged.length >= total) setDone(true);
      return merged;
    });
    setLoading(false);
  }, [loading, done, categorySlug, search, sort, pageSize, items.length, total]);

  useEffect(() => {
    if (done) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done]);

  return (
    <>
      <ul className="thread-list">
        {items.map((p, idx) => (
          <li className="thread" key={p.id}>
            <div className="th-no">{total - idx}</div>
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

      {!done && <div ref={sentinel} style={{ height: 1 }} />}
      {loading && <div className="empty" style={{ marginTop: 12 }}>불러오는 중…</div>}
      {done && items.length > pageSize && <div className="footer-bottom" style={{ textAlign: "center", border: 0 }}>마지막 글까지 봤어요 👋</div>}
    </>
  );
}
