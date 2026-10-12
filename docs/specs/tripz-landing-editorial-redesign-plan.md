# Tripz Landing Editorial Redesign — Plan

## Technical approach

1. Replace the route-owned `LandingPage.tsx` composition only; leave the public layout and global token system untouched.
2. Define a landing-local CSS vocabulary in a colocated stylesheet so orange editorial tokens cannot leak into authenticated or planner surfaces.
3. Reuse the checked-in Vietnam road-trip image asset with `next/image`; no external image host or dependency is introduced.
4. Use existing `lucide-react` icons and `Link` destinations. Interactive planner fields are presentation-only controls that navigate to the real new-trip route on submit.
5. Update home-route E2E assertions to the approved new hierarchy and normal-flow header behavior.

## Responsive strategy

- Desktop: asymmetrical 5/7 hero, image-led feature story, split itinerary and safety sections.
- Tablet: preserve hierarchy while stacking content at practical widths.
- Mobile: stack content in reading order; collapse menu; maintain 44px controls.

## Risk controls

- No global styles, shared components, data contracts, or external assets are changed.
- All wording follows the supplied Vietnamese product brief; no new factual claims are added beyond its supplied figures and content.
