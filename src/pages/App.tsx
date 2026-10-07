import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function AppPage() {
  usePageMeta({
    title: "Dashboard — Flight Price Notifier",
    description: "你的航線追蹤儀表板。",
    ogTitle: "Dashboard — Flight Price Notifier",
    ogDescription: "Your flight route tracking dashboard.",
    robots: "noindex",
  });
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/signin");
      else setEmail(session.user.email ?? "");
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/signin");
      else setEmail(data.user.email ?? "");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        right={
          <button onClick={signOut} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-accent">
            <LogOut className="h-4 w-4" /> Sign out / 登出
          </button>
        }
      />
      <main className="flex flex-1 items-center justify-center bg-gradient-hero px-4">
        {email === null ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="animate-fade-up max-w-xl rounded-2xl border border-border bg-card p-10 text-center">
            <h1 className="text-3xl font-bold">
              Hi <span className="text-gradient break-all">{email}</span>
            </h1>
            <p className="mt-5 leading-relaxed">你的航線追蹤儀表板即將上線 — 下一個里程碑會加上訂閱航線的功能。</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your dashboard is coming soon. Route-subscription will be added in the next milestone.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
