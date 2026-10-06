import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Flight Price Notifier" },
      { name: "description", content: "登入 Flight Price Notifier，管理你的機票降價通知。" },
      { property: "og:title", content: "Sign in — Flight Price Notifier" },
      { property: "og:description", content: "Sign in to manage your flight price alerts." },
    ],
  }),
  component: () => <AuthForm mode="signin" />,
});
