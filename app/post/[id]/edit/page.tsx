import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPost } from "@/lib/posts";
import WriteForm from "@/components/write-form";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/post/${id}/edit`);

  const post = await getPost(supabase, id);
  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/post/${id}`); // 본인 글만

  const { data: categories } = await supabase.from("xrc_categories").select("*").order("id");

  return (
    <main className="page" style={{ maxWidth: 880 }}>
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span>
        <Link href={`/post/${id}`}>글</Link><span className="sep">›</span>
        <span>수정</span>
      </nav>
      <WriteForm
        categories={(categories as Category[]) || []}
        authorId={user.id}
        initial={{
          id: post.id,
          category_id: post.category_id,
          tag: post.tag,
          title: post.title,
          content: post.content,
          tags: post.tags,
          image_urls: post.image_urls,
        }}
      />
    </main>
  );
}
