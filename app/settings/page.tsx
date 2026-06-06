import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const { data: profile } = await supabase
    .from("xrc_profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="page" style={{ maxWidth: 640 }}>
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span className="sep">›</span><span>설정</span>
      </nav>
      <SettingsForm
        userId={user.id}
        initialUsername={profile?.username || user.email?.split("@")[0] || "회원"}
        initialAvatar={profile?.avatar_url || null}
      />
    </main>
  );
}
