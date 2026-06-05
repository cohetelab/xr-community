import Link from "next/link";
import { type PostRow, excerpt, timeAgo } from "@/lib/posts";

export default function PostCard({ p }: { p: PostRow }) {
  const icon = p.xrc_categories?.icon || "📝";
  const author = p.xrc_profiles?.username || "익명";
  return (
    <li>
      <Link className="post" href={`/post/${p.id}`}>
        <div className="post-thumb">{icon}</div>
        <div className="post-main">
          <span className="post-cat">{p.xrc_categories?.name || "일반"}{p.tag ? ` · ${p.tag}` : ""}</span>
          <h4 className="post-title">{p.title}</h4>
          <p className="post-excerpt">{excerpt(p.content)}</p>
          <div className="post-meta">
            <span className="post-author"><span className="avatar">{author[0]}</span>{author}</span>
            <span>{timeAgo(p.created_at)}</span>
            <span className="post-stats">
              <span>👁 {p.views.toLocaleString()}</span>
              <span>♥ {p.like_count}</span>
              <span>💬 {p.comment_count}</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
