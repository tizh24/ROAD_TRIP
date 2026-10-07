# Jadoo-Inspired Public Landing — Technical Plan

**Version:** 0.1.0  
**Status:** Ready for task breakdown after spec approval  
**Specification:** `./spec.md`

## 1. Implementation boundary

This is a presentational replacement of the `/` route and public shell only.
It will not alter service contracts, database ownership, authorization, or
authenticated role layouts. The current `LandingPage.tsx` is the replacement
target; `app/(public)/layout.tsx` currently injects a global `Navbar`, so the
plan separates the home shell from public sub-routes before introducing the
new header/footer.

## 2. Proposed component ownership

| Location | Responsibility |
| --- | --- |
| `features/community/components/LandingPage.tsx` | Assemble the public landing sections and local content data. |
| `features/community/components/landing/*` | Stateless section components: header, hero, services, destination cards, steps, testimonial, subscribe panel and footer. |
| `components/ui/*` | Reuse/extend shared button, dialog and accessible menu primitives only where they suit all product areas. |
| `app/(public)/layout.tsx` | Keep generic public layout free of the current global navbar; home owns its marketing header/footer. |
| `app/globals.css` | Add narrowly scoped landing tokens/utilities; do not replace tokens used by authenticated product screens. |

## 3. Assets and typography

1. Inventory current local assets and `next.config.ts` image policy.
2. Use approved local image assets where available; otherwise use a clearly
   permitted source and configure Next image handling deliberately. No images
   are copied from Jadoo/Figma.
3. Load a Vietnamese-capable editorial display font and UI sans font through
   the existing Next font boundary, with robust fallback stacks.
4. Add landing-scoped colors, radii, shadows and responsive spacing that evoke
   the reference without changing active dashboards and planner tokens.

## 4. Delivery sequence

1. Refactor the public shell so `/explore` and public trip pages retain their
   appropriate generic navigation, while `/` can render its own marketing
   header and footer without duplicate landmarks.
2. Replace the current route planner/checklist home composition with semantic
   sections and a single source of typed content data.
3. Build the desktop header and accessible mobile disclosure menu; connect all
   actions to current routes/anchors.
4. Build hero, service cards, destination cards and step-by-step planning
   narrative; use responsive grids and image aspect-ratio containers.
5. Build testimonial/logo and subscription panels. Keep subscription UI honest
   until an API is specified; validation errors use accessible live feedback.
6. Implement footer, reduced-motion styling, focus states, hover/touch states,
   meaningful alt text, and landmark/heading hierarchy.
7. Remove obsolete home-only helper components/imports and ensure no old
   layout is rendered alongside the new page.

## 5. Responsive and accessibility strategy

- Start at 320px: one-column sections, touch-size controls, menu disclosure,
  horizontal-safe content and non-overlapping decor.
- At tablet, use two-column hero and card grids where room permits; at desktop,
  use the reference-inspired editorial composition without fixed viewport
  heights.
- Preserve `main`, `header`, `nav`, `section`, `footer`, a logical heading
  sequence, visible `:focus-visible`, 44px-touch-target intent, and reduced
  motion compatibility.
- Treat decorative flourishes as `aria-hidden`; caption meaningful destination
  imagery and avoid color-only distinction.

## 6. Verification

1. Run `npm run lint`, `npm run typecheck`, and `npm test` from `web/`.
2. Add/update a focused Playwright check verifying home sections and CTA hrefs
   at a desktop and mobile viewport.
3. Manually check 320px, 768px and 1440px views; test tab order, menu open/
   close, focus visibility, form validation, reduced motion, image fallback
   behavior and route preservation.
4. Run `npm run build` after asset/font and routing updates.

## 7. Risks and decisions

- The only supplied design is a static screenshot. Its visual hierarchy can be
  implemented, but animation/video behavior and exact mobile specs are not
  assumed.
- Replacing partner/admin/traveler UI with the Jadoo style would be a separate
  multi-surface redesign; it is intentionally not inferred from a public
  landing reference.
- Newsletter persistence is deferred rather than mocked to avoid collecting
  user email without a defined owner, consent policy, and backend contract.
