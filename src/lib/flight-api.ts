// Flight API (AWS API Gateway → Lambda → DynamoDB). The browser holds no AWS
// credentials; it only calls these public endpoints.
const API_BASE: string =
  import.meta.env["VITE_FLIGHT_API_URL"] ??
  "https://tdzs7gh90i.execute-api.us-east-1.amazonaws.com";

export type PlanName = "tokyo" | "seoul";

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
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`讀取訂閱失敗 (${res.status})`);
  const data = (await res.json()) as { items: Subscription[] };
  return data.items;
}

export async function saveSubscription(
  email: string,
  planName: PlanName,
  targetPrice: number,
): Promise<void> {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, plan_name: planName, target_price: targetPrice }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `訂閱失敗 (${res.status})`);
  }
}
