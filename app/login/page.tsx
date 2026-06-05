import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { tab?: string; next?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const next = searchParams.next || "/";
  if (user) redirect(next);

  const initialTab = searchParams.tab === "signup" ? "signup" : "login";
  return <AuthForm initialTab={initialTab} next={next} />;
}
