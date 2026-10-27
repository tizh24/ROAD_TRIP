import { toast } from "@/components/ui/sonner";

export type OAuthProvider = "google" | "facebook" | "apple";

export const oauthProviders: ReadonlyArray<{ id: OAuthProvider; label: string }> = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
  { id: "apple", label: "Apple" },
];

/**
 * Seam for social sign-in. The Gateway has no provider flow yet, so this only tells the
 * user so. Replace the body with the redirect to the Gateway OAuth start endpoint once
 * it exists (see the UI rebuild spec).
 */
export function startOAuth(provider: OAuthProvider): void {
  const label = oauthProviders.find((item) => item.id === provider)?.label ?? provider;
  toast.info(`Đăng nhập bằng ${label} chưa được bật. Vui lòng dùng email và mật khẩu.`);
}
