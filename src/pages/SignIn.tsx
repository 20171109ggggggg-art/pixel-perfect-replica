import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function SignIn() {
  usePageMeta({
    title: "Sign in — Flight Price Notifier",
    description: "登入 Flight Price Notifier，管理你的機票降價通知。",
    ogTitle: "Sign in — Flight Price Notifier",
    ogDescription: "Sign in to manage your flight price alerts.",
  });

  return <AuthForm mode="signin" />;
}
