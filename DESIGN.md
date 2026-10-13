---
name: Tripz
description: Premium editorial road-trip platform for Vietnam
colors:
  primary: "#E87535"
  primary-hover: "#C95C24"
  secondary: "#1B1B1B"
  accent: "#FFF1E6"
  accent-sub: "#F8DDC9"
  success: "#46705A"
  warning: "#A35E00"
  danger: "#B9382B"
  info: "#0369A1"
  background: "#FAF9F6"
  background-warm: "#FFF1E6"
  surface: "#FFFFFF"
  surface-tint: "#F8E6D8"
  text-main: "#1B1B1B"
  text-sub: "#6E665E"
  border-main: "#EAE7E2"
  border-light: "#F0EDE8"
typography:
  display:
    fontFamily: "Be Vietnam Pro, Satoshi, Aptos Display, Segoe UI, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, Be Vietnam Pro, Aptos, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  card: "14px"
  panel: "16px"
  full: "9999px"
---

# Design System: Tripz

## Creative north star

Tripz is a premium Vietnamese road-trip editorial: sun-worn paper, charcoal ink, warm orange route markings and real travel photography. Public pages persuade through cinematic composition; planning, partner and admin surfaces keep the same material vocabulary while remaining task-first and dense enough to operate.

## Foundations

- **Canvas:** off-white `#FAF9F6`; surfaces are white only when they need separation.
- **Ink:** charcoal `#1B1B1B` for headings and primary content; warm gray `#6E665E` for supporting text.
- **Action:** Tripz orange `#E87535`, with `#C95C24` hover, is reserved for primary actions, active route states and meaningful emphasis.
- **Rules and depth:** use warm borders (`#EAE7E2`) and soft brown-tinted elevation only for floating or interactive objects.
- **Typography:** Be Vietnam Pro leads editorial headings; Inter carries body and operational text. Vietnamese diacritics must never clip.

## Layout and interaction

- Marketing surfaces use spacious asymmetric editorial compositions and photo-led moments.
- Operate surfaces favour map-first or task-first layouts, visible hierarchy and compact but breathable scanning density.
- Interactive targets are at least 44px on touch screens. Focus rings use the primary orange with a visible offset.
- Motion is purposeful: route/waypoint sequences, concise feedback and state continuity. Respect `prefers-reduced-motion`.
- Avoid generic dashboard card grids, excessive decoration, fabricated metrics and decorative controls without a real action.

## Component rules

- Buttons and inputs: 8–12px radius; cards: 12–16px; chips may use a pill radius.
- Primary controls use orange; secondary controls stay restrained on surface/outline treatments.
- Keep meaningful images accessible with specific alternative text.
- Route maps, markers and route lines use the primary orange; status colours must remain semantically distinct.
