import { useEffect, useState } from "react";
import { Check, Clock, Plane, XCircle } from "lucide-react";
import {
  MONTHLY_PRICE_TWD,
  cancelSubscription,
  goToCheckout,
  listSubscriptions,
  saveSubscription,
  type PlanName,
  type Subscription,
} from "@/lib/flight-api";

const PLANS: { name: PlanName; route: string; label: string; hint: number }[] = [
  { name: "tokyo", route: "TPE-TYO", label: "台北 ✈ 東京", hint: 9325 },
  { name: "seoul", route: "TPE-SEL", label: "台北 ✈ 首爾", hint: 5989 },
  { name: "london", route: "TPE-LON", label: "台北 ✈ 倫敦", hint: 21312 },
];

type CardState = "none" | "unpaid" | "active" | "grace" | "ended";

function cardState(sub: Subscription | undefined): CardState {
  if (!sub) return "none";
  const st = sub.subscription_status;
  if (st === "active") return "active";
  if (st === "cancelled") {
    // Fixed-width UTC strings, so a string compare is a time compare.
    const now = new Date().toISOString().slice(0, 19) + "Z";
    return (sub.current_period_end ?? "") >= now ? "grace" : "ended";
  }
  if (st === "expired") return "ended";
  return "unpaid"; // pending_payment, or a pre-M2 row with no status
}

function StatusBadge({ state, until }: { state: CardState; until?: string | undefined }) {
  const base = "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold";
  if (state === "active")
    return (
      <span className={`${base} bg-primary text-primary-foreground`}>
        <Check className="h-3 w-3" /> 已訂閱
      </span>
    );
  if (state === "grace")
    return (
      <span className={`${base} bg-secondary text-secondary-foreground`}>
        <Clock className="h-3 w-3" /> 已取消 · 有效至 {until}
      </span>
    );
  if (state === "unpaid")
    return (
      <span className={`${base} bg-destructive/10 text-destructive`}>
        <Clock className="h-3 w-3" /> 未完成付款
      </span>
    );
  if (state === "ended")
    return (
      <span className={`${base} bg-muted text-muted-foreground`}>
        <XCircle className="h-3 w-3" /> 已結束
      </span>
    );
  return null;
}

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
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = cardState(subscription);
  const paid = state === "active" || state === "grace";

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
      const result = await saveSubscription(email, plan.name, price);
      if (result.kind === "checkout") {
        goToCheckout(result.html);
        return;
      }
      const now = new Date().toISOString();
      onSaved({
        ...(subscription as Subscription),
        target_price: price,
        updated_at: now,
        subscription_status: result.subscription_status,
        current_period_end_date:
          result.current_period_end_date ?? subscription?.current_period_end_date,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "訂閱失敗");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (!subscription) return;
    const until = subscription.current_period_end_date;
    if (
      !window.confirm(
        `確定要取消 ${plan.label} 的訂閱嗎？之後不會再扣款${until ? `，已付費的這一期到 ${until} 前仍會通知你` : ""}。`,
      )
    )
      return;
    setCancelling(true);
    setError(null);
    try {
      const r = await cancelSubscription(email, plan.route);
      onSaved({
        ...subscription,
        subscription_status: r.subscription_status,
        current_period_end_date: r.current_period_end_date,
        current_period_end: subscription.current_period_end,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消失敗");
    } finally {
      setCancelling(false);
    }
  }

  const description = (() => {
    const tp = subscription ? `NT$${subscription.target_price.toLocaleString()}` : "";
    if (state === "active") return `目前目標價 ${tp}，票價低於等於此價時寄信通知你。`;
    if (state === "grace")
      return `已取消續訂，不會再扣款。${subscription?.current_period_end_date} 前仍會照目標價 ${tp} 通知你。`;
    if (state === "unpaid") return `目標價 ${tp} 已存好，完成付款後才會開始通知。`;
    if (state === "ended") return `訂閱已結束，重新訂閱即可恢復通知。`;
    return `目前最低價約 NT$${plan.hint.toLocaleString()}，設一個你願意出發的價格。`;
  })();

  const submitLabel = saving
    ? paid
      ? "儲存中…"
      : "前往付款…"
    : paid
      ? "更新目標價"
      : state === "unpaid"
        ? `完成付款 NT$${MONTHLY_PRICE_TWD}/月`
        : state === "ended"
          ? `重新訂閱 NT$${MONTHLY_PRICE_TWD}/月`
          : `訂閱 NT$${MONTHLY_PRICE_TWD}/月`;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Plane className="h-5 w-5 text-primary" /> {plan.label}
        </h2>
        <StatusBadge state={state} until={subscription?.current_period_end_date} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
        {submitLabel}
      </button>
      {!paid && (
        <p className="mt-2 text-xs text-muted-foreground">
          透過綠界 ECPay 信用卡定期定額，每月自動扣款，可隨時取消。
        </p>
      )}
      {state === "active" && (
        <button
          type="button"
          onClick={cancel}
          disabled={cancelling}
          className="mt-3 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-destructive disabled:opacity-60"
        >
          {cancelling ? "取消中…" : "取消訂閱"}
        </button>
      )}
    </form>
  );
}

export function PlanCards({ email }: { email: string }) {
  const purchase = new URLSearchParams(window.location.search).get("purchase");
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
      {purchase === "success" && (
        <p className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          付款完成，謝謝！訂閱狀態會在綠界通知後幾秒內更新，如果還顯示「未完成付款」請重新整理。
        </p>
      )}
      {purchase === "failed" && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          付款沒有成功，可以再按一次「完成付款」重試。
        </p>
      )}
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
