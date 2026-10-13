"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { getSafeInternalPath } from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };
export type AuthFormState = {
  error: string | null;
  message: string | null;
};

export const initialAuthFormState: AuthFormState = { error: null, message: null };

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getPassword(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

async function getAuthRedirectUrl(nextPath: string) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? requestHeaders.get("x-forwarded-host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (!origin) return undefined;

  const normalizedOrigin = origin.startsWith("http") ? origin : `${protocol}://${origin}`;
  try {
    return new URL(`/auth/callback?next=${encodeURIComponent(nextPath)}`, normalizedOrigin).toString();
  } catch {
    return undefined;
  }
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Vui lòng nhập email và mật khẩu." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail) || password.length < 8) {
    return { error: "Email hoặc mật khẩu không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { error: "Không thể đăng nhập. Hãy kiểm tra lại email và mật khẩu." };
  }

  revalidatePath("/", "layout");
  (await cookies()).set("rt_login_completed", "password", {
    path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 120,
  });
  redirect(getSafeInternalPath(formData.get("next")) ?? "/profile");
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = getText(formData, "fullName");
  const email = getText(formData, "email").toLowerCase();
  const password = getPassword(formData, "password");
  const passwordConfirmation = getPassword(formData, "passwordConfirmation");

  if (fullName.length < 2 || fullName.length > 80) {
    return { error: "Vui lòng nhập tên hiển thị từ 2 đến 80 ký tự.", message: null };
  }
  if (!isValidEmail(email)) {
    return { error: "Vui lòng nhập một địa chỉ email hợp lệ.", message: null };
  }
  if (password.length < 8) {
    return { error: "Mật khẩu cần có ít nhất 8 ký tự.", message: null };
  }
  if (password !== passwordConfirmation) {
    return { error: "Xác nhận mật khẩu chưa khớp.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: await getAuthRedirectUrl(
        getSafeInternalPath(formData.get("next")) ?? "/profile",
      ),
    },
  });

  if (error) {
    return { error: "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.", message: null };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(getSafeInternalPath(formData.get("next")) ?? "/profile");
  }

  return {
    error: null,
    message: "Nếu email có thể dùng để đăng ký, Tripz đã gửi hướng dẫn xác nhận đến hộp thư của bạn.",
  };
}

export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getText(formData, "email").toLowerCase();

  if (!isValidEmail(email)) {
    return { error: "Vui lòng nhập một địa chỉ email hợp lệ.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await getAuthRedirectUrl("/reset-password"),
  });

  if (error) {
    return { error: "Không thể gửi hướng dẫn lúc này. Vui lòng thử lại sau.", message: null };
  }

  return {
    error: null,
    message: "Nếu email này có tài khoản Tripz, hướng dẫn đặt lại mật khẩu đã được gửi.",
  };
}

export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = getPassword(formData, "password");
  const passwordConfirmation = getPassword(formData, "passwordConfirmation");

  if (password.length < 8) {
    return { error: "Mật khẩu mới cần có ít nhất 8 ký tự.", message: null };
  }
  if (password !== passwordConfirmation) {
    return { error: "Xác nhận mật khẩu chưa khớp.", message: null };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu liên kết mới.", message: null };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Không thể cập nhật mật khẩu. Vui lòng yêu cầu một liên kết mới.", message: null };
  }

  return { error: null, message: "Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại ngay bây giờ." };
}

export async function updateProfileName(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = getText(formData, "fullName");
  if (fullName.length < 2 || fullName.length > 80) {
    return { error: "Tên hiển thị cần có từ 2 đến 80 ký tự.", message: null };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", message: null };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: "Không thể lưu tên hiển thị lúc này. Vui lòng thử lại.", message: null };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { error: null, message: "Đã lưu tên hiển thị." };
}
