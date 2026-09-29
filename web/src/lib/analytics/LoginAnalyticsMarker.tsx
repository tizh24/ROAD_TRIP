"use client";

import { useEffect } from "react";
import { trackAnalytics } from "./analytics";

export default function LoginAnalyticsMarker() {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )rt_login_completed=(password|pkce)(?:;|$)/);
    if (!match) return;
    const method = match[1] as "password" | "pkce";
    document.cookie = "rt_login_completed=; Path=/; Max-Age=0; SameSite=Lax";
    trackAnalytics("login_completed", { method }, { dedupeKey: `${method}:${Date.now()}` });
  }, []);
  return null;
}
