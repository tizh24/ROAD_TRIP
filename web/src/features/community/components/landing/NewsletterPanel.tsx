"use client";

import { useState, type FormEvent } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// There is no subscription service yet, so this form validates input and says
// plainly that nothing was stored. It never reports a fake success.
export default function NewsletterPanel() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(undefined);
    if (!emailPattern.test(email.trim())) {
      setError("Nhập một địa chỉ email hợp lệ, ví dụ ten@example.com.");
      return;
    }
    setError(undefined);
    setNotice("Bản tin chưa khả dụng nên Tripz chưa lưu email của bạn. Bạn có thể bắt đầu lên kế hoạch ngay mà không cần đăng ký.");
  }

  return (
    <section aria-labelledby="newsletter-title" className="bg-secondary text-white">
      <div className="page-shell grid gap-8 py-14 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-center lg:py-20">
        <div>
          <h2 id="newsletter-title" className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            Nhận gợi ý cung đường khi bản tin ra mắt.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
            Chúng tôi đang chuẩn bị bản tin về các cung đường theo mùa. Hiện chưa có dịch vụ đăng ký, nên biểu mẫu này chưa lưu thông tin của bạn.
          </p>
        </div>
        <form onSubmit={submit} noValidate className="grid gap-3">
          <label htmlFor="newsletter-email" className="text-sm font-bold">Email của bạn</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby="newsletter-feedback"
              placeholder="ten@example.com"
              className="focus-ring min-h-12 w-full rounded-lg border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/50"
            />
            <button type="submit" className="focus-ring min-h-12 shrink-0 rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover">
              Gửi email
            </button>
          </div>
          <div id="newsletter-feedback" aria-live="polite">
            {error ? <p role="alert" className="text-sm font-semibold text-[#ffd2bd]">{error}</p> : null}
            {notice ? <p role="status" className="text-sm text-white/85">{notice}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
