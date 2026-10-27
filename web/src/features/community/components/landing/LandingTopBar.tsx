import Link from "next/link";
import { Compass } from "lucide-react";
import { landingRoutes } from "./content";

/** No navigation bar: the mark sits on the hero's alignment, one account link sits top-right. */
export default function LandingTopBar({ signedIn }: { signedIn: boolean }) {
  const account = signedIn
    ? { href: landingRoutes.dashboard, label: "Chuyến đi của tôi" }
    : { href: landingRoutes.login, label: "Đăng nhập" };

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 pt-8 md:px-12 md:pt-14">
        <Link href="/" aria-label="Tripz, về trang chủ" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md md:ml-[27%]">
          <span className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Compass className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">Tripz</span>
        </Link>
        <Link href={account.href} className="focus-ring inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
          {account.label}
        </Link>
      </div>
    </header>
  );
}
