import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WriteForm from "@/components/write-form";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WritePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/write");

  const { data: categories } = await supabase.from("xrc_categories").select("*").order("id");

  return (
    <main className="page" style={{ maxWidth: 880 }}>
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span>
        <Link href="/board">포럼</Link><span className="sep">›</span>
        <span>글쓰기</span>
      </nav>
      <WriteForm categories={(categories as Category[]) || []} authorId={user.id} />
    </main>
  );
}
