---
name: Tripz
description: Neutral, task-first interface for a Vietnamese road-trip planner
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
typography:
  family: "Inter"
  numerals: "tabular-nums, regular weight"
rounded:
  base: "0.625rem"
---

# Design System: Tripz

The previous orange, off-white, editorial system is retired. This file is the short contract; the reasoning is in `docs/design/direction.md`.

## Rules

- Light theme only. Inter only. Neutral scale with a near-black primary action.
- Color goes on data, not chrome: one chart color on the main data element, one small signal where a figure changed. Chart tokens `--chart-1..5` are for charts and for the auth stage wash only.
- Landing follows the taste-skill `product-performs` direction: the working product appears as real HTML fragments (`data-ui`). No invented statistics, testimonials, ratings, traveler counts or prices.
- App screens follow `achromatic-ledger`: flat surfaces separated by 1px rules, KPIs as type, tables with rules and right-aligned tabular figures, honest zeros and dashes, empty sections keep their frame. Shell is a labelled sidebar that collapses to an icon rail.
- Shared primitives are shadcn/ui on Radix in `web/src/components/ui/`. Overlays use Dialog, AlertDialog, Sheet and Sonner only.
- Accessibility: AA contrast, visible focus, one `main` and one `h1` per page, skip link, 44px touch targets on mobile, reduced-motion support.
