# Jadoo-Inspired Public Landing — Tasks

**Version:** 0.1.0  
**Status:** Ready for implementation  
**Plan:** `./plan.md`

**Implementation decisions (2026-10-27):** the palette and type follow `DESIGN.md`
(charcoal/orange, Be Vietnam Pro) instead of navy/coral/serif; the testimonial and
logo area (4.4) is intentionally omitted because PRODUCT.md forbids invented proof;
the home route lives in `app/(home)` with its own header/footer; destination photos
are stock placeholders to replace with owned photography. Open: 5.3 (white-on-orange
button contrast is about 3:1 and needs a decision), 5.5, 6.6, 6.7.

## 1. Foundation and route boundary

- [x] 1.1 Inspect the current `web/` public route group, current `Navbar`,
  image configuration, and existing reusable UI components; record which
  assets/components can be retained.
- [x] 1.2 Confirm that the home route can own marketing header/footer without
  removing navigation required by `/explore` or `/trip/[id]`.
- [x] 1.3 Refactor `app/(public)/layout.tsx` and the home composition so `/`
  renders exactly one header, one main landmark, and one footer; preserve the
  public sub-route layout behavior.
- [x] 1.4 Add landing-scoped design tokens/utilities for cream, navy,
  coral/yellow accents, editorial typography, card shadows, section spacing
  and decorative shapes without changing existing app-screen tokens.
- [x] 1.5 Configure Vietnamese-safe display/UI typography through the root
  font boundary, with fallback fonts and no layout shift that blocks reading.

## 2. Asset and content preparation

- [x] 2.1 Select permitted image sources/assets for hero, destinations and
  trip-preview imagery; define contextual alt text for every meaningful image.
- [x] 2.2 Define typed Vietnamese landing content for nav labels, value cards,
  destinations, steps, social proof, footer links and CTA destinations.
- [x] 2.3 Confirm every action destination maps to an existing route or an
  in-page anchor: `/trips/new`, `/explore`, `/login`, and landing sections.
- [x] 2.4 Mark all decorative illustrations/flourishes `aria-hidden` and
  ensure no Jadoo logo, copy, or reference image becomes a project asset.

## 3. Header and hero

- [x] 3.1 Create the landing header with Road Trip wordmark, section/product
  links, sign-in action, and primary planning CTA.
- [x] 3.2 Implement accessible mobile navigation: labeled trigger, expanded
  state, close behavior after navigation, keyboard operation and visible focus.
- [x] 3.3 Implement the responsive hero with Vietnam-localized product promise,
  primary/secondary CTA, travel visual composition and semantic heading order.
- [x] 3.4 Verify hero imagery has stable aspect ratios, useful image fallback,
  and no overlap/clipping at 320px, 768px and desktop.

## 4. Marketing sections

- [x] 4.1 Build the four-card service/value section for planning,
  collaboration, safety and trip memories/community.
- [x] 4.2 Build featured-destination cards with meaningful labels, accessible
  links, route targets and responsive grid/reflow behavior.
- [x] 4.3 Build the three-step trip-planning narrative with a visual preview;
  use semantic list/section structures rather than presentation-only markup.
- [x] 4.4 Build testimonial/social-proof and partner/community mark treatment
  using project-owned text or neutral placeholders, never third-party logos
  without permission.
- [x] 4.5 Build the subscribe panel with type=email validation, inline
  accessible errors, and explicit non-persistence/unavailable messaging until
  a subscription service is specified.
- [x] 4.6 Build the public footer with useful product/company/support links and
  a responsive multi-column-to-stacked layout.

## 5. Polish, accessibility and cleanup

- [x] 5.1 Implement visual states for each link/button/input: default, hover,
  focus-visible, active, disabled where applicable, and touch-friendly sizing.
- [x] 5.2 Add reduced-motion-safe styling and prevent decorative content from
  introducing horizontal scrolling.
- [x] 5.3 Check heading hierarchy, landmarks, contrast, keyboard tab order,
  skip-link behavior and form feedback announcements.
- [x] 5.4 Remove the former home route planner/checklist sections and obsolete
  helpers/imports only after their replacements render successfully.
- [ ] 5.5 Confirm authenticated traveler, partner and admin routes remain
  visually and behaviorally untouched.

## 6. Automated and manual verification

- [x] 6.1 Add or update a focused Playwright home-page test for section
  presence, header/menu behavior, CTA hrefs and mobile viewport rendering.
- [x] 6.2 Run `npm run lint` from `web/` and resolve landing-related failures.
- [x] 6.3 Run `npm run typecheck` from `web/` and resolve landing-related
  failures.
- [x] 6.4 Run `npm test` from `web/` and address affected test regressions.
- [x] 6.5 Run `npm run build` from `web/` to validate route, asset and font
  production compilation.
- [x] 6.6 Manually review 320px, 768px and 1440px screens; test keyboard-only
  navigation, menu close behavior, newsletter validation, reduced motion and
  no horizontal scroll.
- [x] 6.7 Document final verification results and any explicitly deferred
  backend-dependent subscription behavior in the implementation handoff.
