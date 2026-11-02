// Flight API (AWS API Gateway → Lambda → DynamoDB). The browser holds no AWS
// credentials; it only calls these public endpoints.
const API_BASE: string =
  import.meta.env["VITE_FLIGHT_API_URL"] ??
  "https://tdzs7gh90i.execute-api.us-east-1.amazonaws.com";

// Display only: the amount actually charged is `amount` in the flight/ecpay secret.
export const MONTHLY_PRICE_TWD = 300;

export type PlanName = "tokyo" | "seoul" | "london";

// pending_payment → active → cancelled (still alerted until current_period_end) → expired.
// Rows created before M2 have no status and are treated as unpaid.
export type SubscriptionStatus = "pending_payment" | "active" | "cancelled" | "expired";

export interface Subscription {
  email: string;
  route: string;
  plan_name: PlanName;
  origin: string;
  destination: string;
  target_price: number;
  currency: "TWD";
  created_at: string;
  updated_at: string;
  subscription_status?: SubscriptionStatus;
  current_period_end?: string | undefined;
  current_period_end_date?: string | undefined;
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`讀取訂閱失敗 (${res.status})`);
  const data = (await res.json()) as { items: Subscription[] };
  return data.items;
}

export type SaveResult =
  | { kind: "checkout"; html: string }
  | {
      kind: "updated";
      subscription_status: SubscriptionStatus;
      current_period_end_date?: string | undefined;
    };

// /subscribe returns text/html (an auto-submitting ECPay checkout form) for anyone who
// still has to pay, or JSON when a paid subscriber only changes the target price.
export async function saveSubscription(
  email: string,
  planName: PlanName,
  targetPrice: number,
): Promise<SaveResult> {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, plan_name: planName, target_price: targetPrice }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `訂閱失敗 (${res.status})`);
  }
  if ((res.headers.get("content-type") ?? "").includes("text/html")) {
    return { kind: "checkout", html: await res.text() };
  }
  const data = (await res.json()) as {
    subscription_status: SubscriptionStatus;
    current_period_end_date?: string | undefined;
  };
  return { kind: "updated", ...data };
}

// Hands the browser to ECPay's cashier; the returned form submits itself.
export function goToCheckout(html: string) {
  document.open();
  document.write(html);
  document.close();
}

export async function cancelSubscription(
  email: string,
  route: string,
): Promise<{
  subscription_status: SubscriptionStatus;
  current_period_end_date?: string | undefined;
}> {
  const res = await fetch(`${API_BASE}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, route }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    subscription_status: SubscriptionStatus;
    current_period_end_date?: string | undefined;
  };
  if (!res.ok) throw new Error(data.error ?? `取消失敗 (${res.status})`);
  return data;
}
