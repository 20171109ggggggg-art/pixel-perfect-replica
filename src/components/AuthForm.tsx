import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isUp = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const res = isUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/app" } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (res.error) return setError(res.error.message);
    if (res.data.session) navigate({ to: "/app" });
    else setInfo("請到信箱確認後再登入。Check your email to confirm.");
  }

  const input = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-hero">
      <SiteHeader right={<span />} />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form onSubmit={onSubmit} className="animate-fade-up w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 shadow-glow">
          <div>
            <h1 className="text-2xl font-bold">{isUp ? "註冊 / Sign up" : "登入 / Sign in"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Flight Price Notifier</p>
          </div>
          <label className="block space-y-1.5 text-sm">
            <span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span>Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary-glow">{info}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-gradient-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
            {loading ? "…" : isUp ? "建立帳號 / Create account" : "登入 / Sign in"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {isUp ? "已有帳號？" : "還沒有帳號？"}{" "}
            <Link to={isUp ? "/signin" : "/signup"} className="text-primary-glow hover:underline">
              {isUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
