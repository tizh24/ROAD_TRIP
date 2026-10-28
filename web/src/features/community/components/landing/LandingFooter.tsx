import Link from "next/link";
import { footerLinks, photoCredits } from "./content";

/** A single quiet line, with the picture credits above it in small type. */
export default function LandingFooter() {
  return (
    <footer className="mt-[10svh]">
      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <p className="pb-8 text-[13px] leading-relaxed text-muted-foreground">
          Ảnh:{" "}
          {photoCredits.map((credit, index) => (
            <span key={credit.page}>
              <a href={credit.page} className="underline underline-offset-2 hover:text-foreground" rel="noreferrer">
                {credit.title}
              </a>{" "}
              của {credit.creator} ({credit.licence}, qua Wikimedia Commons)
              {index < photoCredits.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
        <div className="grid gap-2 pb-6 text-sm md:grid-cols-[1fr_auto_1fr] md:items-baseline">
          <p className="text-muted-foreground">Lên kế hoạch đi đường dài</p>
          <nav aria-label="Liên kết chính" className="flex flex-wrap gap-x-6 gap-y-1">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="focus-ring inline-flex min-h-11 items-center hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-muted-foreground md:text-right">© 2026 Tripz</p>
        </div>
      </div>
    </footer>
  );
}
