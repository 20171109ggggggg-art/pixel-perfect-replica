import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function SignUp() {
  usePageMeta({
    title: "Sign up — Flight Price Notifier",
    description: "註冊 Flight Price Notifier，機票降價就通知你。",
    ogTitle: "Sign up — Flight Price Notifier",
    ogDescription: "Create an account and get emailed when fares drop.",
  });

  return <AuthForm mode="signup" />;
}
