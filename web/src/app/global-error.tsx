"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Tripz tạm thời không mở được</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Đã có lỗi nghiêm trọng khi tải ứng dụng. Hãy thử tải lại; nếu lỗi lặp lại, vui lòng quay lại sau.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tải lại
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
