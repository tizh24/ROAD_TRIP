"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSafeInternalPath } from "@/lib/auth/route-protection";
import { gatewayMutation, gatewayProfileMutation } from "@/lib/api/gateway-server";
import type { AuthFormState } from "@/features/auth/form-state";

export type LoginState = { error: string | null };

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

  const result = await gatewayMutation<{ authenticated: boolean }>("/auth/login", {
    email: normalizedEmail,
    password,
  });
  if (result.error || !result.data?.authenticated) {
    return { error: "Không thể đăng nhập. Hãy kiểm tra lại email và mật khẩu." };
  }

  revalidatePath("/", "layout");
  (await cookies()).set("rt_login_completed", "password", {
    path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 120,
  });
  redirect(getSafeInternalPath(formData.get("next")) ?? "/dashboard");
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

  const result = await gatewayMutation<{ confirmationRequired: boolean }>("/auth/register", {
    email,
    password,
    fullName,
  });
  if (result.data && !result.data.confirmationRequired) {
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

  await gatewayMutation<{ accepted: boolean }>("/auth/password/reset", { email });

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

  const result = await gatewayMutation<{ changed: boolean }>("/auth/password/change", { password });
  if (result.error || !result.data?.changed) {
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

  const result = await gatewayProfileMutation({ fullName });
  if (result.error) {
    return { error: "Không thể lưu tên hiển thị lúc này. Vui lòng thử lại.", message: null };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { error: null, message: "Đã lưu tên hiển thị." };
}
