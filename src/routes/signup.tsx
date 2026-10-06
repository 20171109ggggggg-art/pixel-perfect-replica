import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Flight Price Notifier" },
      { name: "description", content: "註冊 Flight Price Notifier，機票降價就通知你。" },
      { property: "og:title", content: "Sign up — Flight Price Notifier" },
      { property: "og:description", content: "Create an account and get emailed when fares drop." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
