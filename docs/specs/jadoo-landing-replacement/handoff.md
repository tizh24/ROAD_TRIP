# Jadoo landing replacement: verification handoff

Date: 2026-10-27. Route: `/` (`web/src/app/(home)`).

## Verified

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (from `web/`) | Pass |
| Playwright `public-landing.spec.ts` (320 / 768 / 1440 px) | Pass: one header, main and footer; all section headings; no horizontal scroll |
| CTA destinations | `/trips/new`, `/explore`, `/login`, `/explore?q=Sa%20Pa`; unauthenticated CTA redirects to `/login?next=...` |
| Mobile menu | Opens with Enter, closes with Escape, focus returns to the toggle |
| Newsletter form | Rejects an invalid email; a valid email shows a status message that says nothing was stored |
| Invented proof | Test asserts no metrics, ratings, testimonials or "AI" claims |
| Contrast | Solid orange buttons use `--color-primary-strong` (#B84E1B, about 5.1:1 with white) |
| Visual review (6.6) | Full-page screenshots at 320 and 1440 px reviewed: no overflow, readable hierarchy, consistent spacing |

Keyboard-only navigation, menu close behavior and newsletter validation are covered by the Playwright tests above; reduced motion is handled in CSS (task 5.2) and was not exercised with a real OS setting.

## Deferred

- **Newsletter subscription**: no backend endpoint exists. The form validates input and states honestly that the email is not stored. Wiring it needs a subscription service and a spec.
- **Destination photos**: stock placeholders. The Hội An image shows food, not the town. Replace with owned photography; keep alt text describing what the photo shows.
- **Task 5.5** (authenticated traveler/partner/admin routes "untouched"): not ticked. The shadcn adoption and the button color change deliberately touched shared components and authenticated screens. Guest route guards are covered by `guest-routes.spec.ts`; authenticated screens need a manual pass with real accounts.
