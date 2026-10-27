import AccountAccessView from "@/features/auth/components/AccountAccessView";

export const metadata = { title: "Đặt mật khẩu mới" };

export default function ResetPasswordPage() {
  return <AccountAccessView mode="reset-password" />;
}
