"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeInternalPath } from "@/lib/auth/route-protection";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

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
  if (!normalizedEmail || password.length < 6) {
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
  redirect(getSafeInternalPath(formData.get("next")) ?? "/profile");
}
