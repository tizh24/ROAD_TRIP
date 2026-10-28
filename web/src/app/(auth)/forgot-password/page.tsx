import AccountAccessView from "@/features/auth/components/AccountAccessView";

export const metadata = { title: "Quên mật khẩu" };

export default function ForgotPasswordPage() {
  return <AccountAccessView mode="forgot-password" />;
}
