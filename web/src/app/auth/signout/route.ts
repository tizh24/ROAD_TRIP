import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { gatewayMutation } from "@/lib/api/gateway-server";

export async function POST(request: NextRequest) {
  await gatewayMutation("/auth/logout", {});

  revalidatePath("/", "layout");
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  const secure = process.env.NODE_ENV === "production";
  for (const name of [
    process.env.NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME ?? "rt_access",
    process.env.NEXT_PUBLIC_AUTH_REFRESH_COOKIE_NAME ?? "rt_refresh",
    process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "rt_csrf",
    "rt_login_completed",
  ]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0, sameSite: "lax", secure });
  }

  return response;
}
