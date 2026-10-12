import { useEffect, useState } from "react";
import { Check, Plane } from "lucide-react";
import {
  listSubscriptions,
  saveSubscription,
  type PlanName,
  type Subscription,
} from "@/lib/flight-api";

const PLANS: { name: PlanName; route: string; label: string; hint: number }[] = [
  { name: "tokyo", route: "TPE-TYO", label: "台北 ✈ 東京", hint: 9325 },
  { name: "seoul", route: "TPE-SEL", label: "台北 ✈ 首爾", hint: 5989 },
];

function PlanCard({
  email,
  plan,
  subscription,
  onSaved,
}: {
  email: string;
  plan: (typeof PLANS)[number];
  subscription: Subscription | undefined;
  onSaved: (s: Subscription) => void;
}) {
  const [target, setTarget] = useState(subscription ? String(subscription.target_price) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) setTarget(String(subscription.target_price));
  }, [subscription]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(target);
    if (!Number.isFinite(price) || price <= 0) {
      setError("請輸入大於 0 的目標價");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveSubscription(email, plan.name, price);
      const now = new Date().toISOString();
      onSaved({
        email,
        route: plan.route,
        plan_name: plan.name,
        origin: "TPE",
        destination: plan.route.slice(4),
        target_price: price,
        currency: "TWD",
        created_at: subscription?.created_at ?? now,
        updated_at: now,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "訂閱失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Plane className="h-5 w-5 text-primary" /> {plan.label}
        </h2>
        {subscription && (
          <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Check className="h-3 w-3" /> 已訂閱
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {subscription
          ? `目前目標價 NT$${subscription.target_price.toLocaleString()}，票價低於等於此價時寄信通知你。`
          : `目前最低價約 NT$${plan.hint.toLocaleString()}，設一個你願意出發的價格。`}
      </p>
      <label className="mt-4 text-sm font-medium" htmlFor={`target-${plan.name}`}>
        目標價（新台幣）
      </label>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">NT$</span>
        <input
          id={`target-${plan.name}`}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          required
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={String(plan.hint)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
        />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "儲存中…" : subscription ? "更新目標價" : "開始追蹤"}
      </button>
    </form>
  );
}

export function PlanCards({ email }: { email: string }) {
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSubscriptions(email)
      .then((items) => {
        if (!cancelled) setSubs(Object.fromEntries(items.map((s) => [s.route, s])));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "讀取訂閱失敗"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (loading) return <p className="text-muted-foreground">讀取訂閱中…</p>;

  return (
    <div className="w-full">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.name}
            email={email}
            plan={plan}
            subscription={subs[plan.route]}
            onSaved={(s) => setSubs((prev) => ({ ...prev, [s.route]: s }))}
          />
        ))}
      </div>
    </div>
  );
}
