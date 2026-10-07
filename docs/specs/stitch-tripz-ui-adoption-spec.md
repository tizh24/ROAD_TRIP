# TripZ Stitch UI Adoption - Specification

**Status:** Draft for approval  
**Target:** `web/` Next.js application  
**Design source:** Stitch project `15324718026349941734` - *TripZ Vietnam Road Planner*

## 1. Objective

Adopt the Stitch TripZ designs as the visual and interaction reference for the current web application, without changing existing routes, authentication, authorization, API contracts, or backend behavior.

The experience must retain a Vietnam road-trip focus: warm light surfaces, emerald route actions, navy structural elements, amber route highlights, map-first planning, and Vietnamese-safe typography.

## 2. Source-of-truth mapping

| Current product surface | Stitch reference | Intended adoption |
| --- | --- | --- |
| `/` | `5e110aca02c44b559421d706c08673d8` - Trang chủ TripZ | Landing structure, visual hierarchy, discovery content, CTA treatment |
| `/login` | `b9fb8169306546ad8522a446795ac263` - Đăng nhập TripZ | Minimal login composition, hierarchy, accessible auth feedback |
| `/trips` | `f45bb73252a24bba908516aa866bce06` - Chuyến đi của tôi | Journey index, status, card and list hierarchy |
| `/trips/new` | `e0ef7264d0794e049e97cfb17e27c1aa` - Tạo chuyến đi mới | Creation flow and contextual route preview |
| `/planner/[id]` | `a655ddee93a9476cb7eebc4401f5a289` desktop and `e011596548d84d53bb4fc4befb60d3df` mobile | Desktop split planner and mobile map plus itinerary treatment |
| Trip collaboration and invitations | `012a79ff5d26464ea0c6ce0cb04405ab` | Member roles, invite, pending and read-only states |
| Save, failure and recovery UI | `bc0769a7ac3d4f9a871afed314d3bfbd` | Saving, offline, retry, conflict and error states |
| In-trip dashboard / trip overview | `73ff2caddc894d7f81cf0018c1be22f8` | Mobile-first trip summary and next-action hierarchy |
| On-the-road mode | `2a6a7f9d7df54827bb9e93de9826a80b` | Glanceable, map-first live-trip layout |

`25fe1466b8774d7fa3826c7b4cf7bc82` is an alternate landing concept. Its coastal-map and GPS language may inform map and route storytelling, but it must not create a second competing landing-page route. The primary landing reference remains `5e110aca02c44b559421d706c08673d8`.

## 3. Design system requirements

- Adopt the Stitch visual direction: warm off-white surfaces, deep emerald primary actions, navy information structure, amber attention/route accents, and restrained elevation.
- Use `Be Vietnam Pro` for display/headings and `Plus Jakarta Sans` for body/control text, while retaining safe fallbacks.
- Use a single documented radius and spacing scale across shared primitives.
- Make map controls, itinerary rails, route summaries and stop states first-class reusable components.
- Preserve WCAG 2.2 AA contrast, keyboard navigation, visible focus, semantic labels, 44px mobile targets and reduced-motion behavior.
- Preserve all meaningful existing data, route names, forms, action semantics and permission behavior.

## 4. Taste Skill policy

Taste Skill is an editorial quality gate, not a replacement design system.

- It applies to public landing, discovery, public trip and community/story surfaces.
- It must not override the Stitch route-planner patterns or force landing-page compositions onto planner, admin, partner or data-dense product screens.
- It must prevent generic AI patterns: arbitrary purple gradients, fake metrics, placeholder CTAs, repetitive three-card grids, decorative glass, fake product screenshots and stock copy.
- It must preserve the Stitch palette, route flows and Vietnamese travel context. Changes are allowed only when they improve hierarchy, accessibility, responsiveness, performance or authenticity.

## 5. Functional and safety boundaries

- This is a UI adoption. Existing API calls, routes, analytics identifiers, authorization rules and backend contracts remain unchanged.
- Do not imply unavailable GPS, routing, payments, social, safety or collaboration features are live.
- Screens must expose loading, empty, error, retry, permission and destructive-confirmation states where the current product supports the underlying action.
- Privacy controls for location, members, memories and billing remain explicit and never become cosmetic-only UI.

## 6. Acceptance criteria

1. Every existing web surface has the same core visual language, with the Stitch screens above used as the direct reference for their matching traveler flows.
2. Desktop planner adopts a map-first split layout; mobile planner adopts full-map plus itinerary bottom-sheet behavior without losing existing stop editing controls.
3. Landing and public discovery feel editorial and travel-specific rather than generic AI marketing, while preserving real navigation targets and content behavior.
4. Login, trip creation, collaboration, autosave and failure states match the Stitch hierarchy without weakening existing auth or role handling.
5. Shared components use the design tokens consistently across public, traveler, partner and admin shells, with denser operational layouts where appropriate.
6. Every changed surface works at mobile and desktop widths, honors reduced motion, and remains keyboard accessible.
7. No production screen ships with invented metrics, fake routes, fake integrations or placeholder actions presented as real functionality.

## 7. Out of scope

- New backend capabilities, data migrations, route changes, role changes and native-mobile implementation.
- Pixel-for-pixel copying of generated Stitch HTML or copyrighted third-party visual assets.
- Replacing all existing product content solely to match a visual composition.

